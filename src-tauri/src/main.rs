#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::Error;
use std::fs::read_dir;
use std::fs::remove_file;
use std::fs::symlink_metadata;
use std::os::windows::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::thread;
use steamworks::AppId;
use steamworks::Client;
use steamworks::ClientManager;
use steamworks::PublishedFileId;

#[derive(serde::Serialize, Clone, Debug)]
struct ModMetadata {
    id: String,
    owner: String,
    url: String,
    title: String,
    description: String,
    time_updated: u32,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
struct SelectedMod {
    filename: String,
    path: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_install_dir(client: tauri::State<steamworks::Client<ClientManager>>) -> String {
    // > We need string, because Steam IDs are too big for js Number type
    client.apps().app_install_dir(AppId(1142710)).to_string()
}

#[tauri::command]
fn launch_game() {
    Command::new("cmd")
        .args(["/C", "start", "D:\\apps\\Modsmith\\Modsmith.exe"])
        .spawn()
        .expect("failed to execute");
}

#[tauri::command]
async fn get_public_steam_user_data(id: String) -> Result<String, String> {
    let request_url = format!("http://steamcommunity.com/profiles/{}/?xml=1", id);
    let result = call_public_steam_api(request_url).await;
    if let Ok(res) = result {
        Ok(res)
    } else {
        Ok(format!("Failed for ID: {}", id).to_string())
    }
}

#[tauri::command]
fn setup_symlinks(
    client: tauri::State<steamworks::Client<ClientManager>>,
    filenames: Vec<SelectedMod>,
) {
    let install_dir = get_install_dir(client);
    println!("{:?}", filenames);
    if filenames.len() > 0 {
        for file in filenames {
            let mut data_dir = PathBuf::new();
            data_dir.push(&install_dir);
            data_dir.push("data");
            data_dir.push(file.filename);

            match fs::symlink_file(file.path, data_dir) {
                Ok(_) => println!("Symlink successful"),
                Err(e) => eprintln!("{:?}", e),
            }
        }
    }
}

#[tauri::command]
fn delete_symlinks(client: tauri::State<steamworks::Client<ClientManager>>) {
    let install_dir = get_install_dir(client);

    let mut data_dir = PathBuf::new();
    data_dir.push(&install_dir);
    data_dir.push("data");

    let paths = read_dir(data_dir)
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.path().as_path().display().to_string())
        .collect::<Vec<_>>();

    for path in paths.iter() {
        let metadata = symlink_metadata(path);
        if let Ok(metadata) = metadata {
            let file_type = metadata.file_type();
            let is_symlink = file_type.is_symlink();
            if is_symlink {
                println!(
                    "Deleting symlink path at: {}, is_symlink: {:?}",
                    path, is_symlink
                );
                match remove_file(path) {
                    Ok(_) => println!("Deleted symlink path at: {}", path),
                    Err(e) => eprintln!("Error deleting symlink: {:?}", e),
                }
            }
        }
    }
}

async fn call_public_steam_api(url: String) -> Result<String, Error> {
    let response = reqwest::get(&url).await?.text().await?;
    Ok(response)
}

#[tauri::command]
fn get_metadata_from_workshop_ids(
    client: tauri::State<steamworks::Client<ClientManager>>,
    ids: Vec<&str>,
) -> Vec<ModMetadata> {
    println!("Getting metadata for workshop IDs...");
    let items = ids
        .into_iter()
        .map(|id| PublishedFileId(id.parse::<u64>().unwrap()))
        .collect();

    //println!("{:?}", items);

    // 2793731221
    // client
    //     .ugc()
    //     .query_item(PublishedFileId(2793731221))
    //     .unwrap()
    //     .fetch(|cb| {
    //         if let Ok(cb) = cb {
    //             println!("single result");
    //         }
    //     });

    let query = match client.ugc().query_items(items) {
        Ok(query) => query,
        Err(e) => panic!("Error creating query: {:?}", e),
    };

    let (tx, rx) = mpsc::channel();

    let mod_metadata = Arc::new(Mutex::new(Vec::<ModMetadata>::new()));
    let c = Arc::clone(&mod_metadata);

    query
        .allow_cached_response(600)
        .include_children(true)
        .include_metadata(true)
        .fetch(move |r| {
            let mut m = c.lock().unwrap();
            let results = r.map_err(Some);
            match results {
                Ok(results) => {
                    for item in results.iter() {
                        if let Some(item) = item {
                            //println!("Pushing to vector");
                            m.push(ModMetadata {
                                id: item.published_file_id.0.to_string(),
                                description: item.description,
                                owner: item.owner.raw().to_string(),
                                title: item.title,
                                url: format!(
                                    "https://steamcommunity.com/sharedfiles/filedetails/?id={}",
                                    item.published_file_id.0
                                ), // this looks empty, parse it manually :(

                                time_updated: item.time_updated,
                            });
                        }
                    }
                    thread::spawn(move || {
                        let val = String::from("Finished.");
                        tx.send(val).unwrap();
                    });
                }
                Err(Some(err)) => eprintln!("Some error: {:?}", err),
                Err(None) => eprintln!("None error"),
            }
        });

    // todo - pass the metadata itself through the message
    rx.recv().unwrap();
    //println!("{:?}", mod_metadata);
    let result = mod_metadata.lock().unwrap().clone();
    result
}

#[tauri::command]
fn get_subscribed_items(client: tauri::State<steamworks::Client<ClientManager>>) -> Vec<String> {
    println!("Getting subscribed items...");
    client
        .ugc()
        .subscribed_items()
        .into_iter()
        .map(|item| item.0.to_string())
        .collect()
}

#[tauri::command]
fn find_mods(client: tauri::State<steamworks::Client<ClientManager>>) -> Vec<String> {
    let install_dir = client.apps().app_install_dir(AppId(1142710)).to_string();
    let workshop_prefix = install_dir.split("common").next().unwrap().to_string();

    let mut workshop_dir = PathBuf::new();
    workshop_dir.push(&workshop_prefix);
    workshop_dir.push("workshop");
    workshop_dir.push("content");
    workshop_dir.push("1142710");

    let paths = read_dir(workshop_dir)
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.path().as_path().display().to_string())
        .collect::<Vec<_>>();

    paths
}

fn main() {
    // 1142710 - WH3 ID
    let (client, single) = Client::init_app(1142710).unwrap();

    let callback_thread = std::thread::spawn(move || loop {
        single.run_callbacks();
        std::thread::sleep(std::time::Duration::from_millis(50));
    });

    tauri::Builder::default()
        .manage(client)
        .invoke_handler(tauri::generate_handler![
            greet,
            get_install_dir,
            launch_game,
            find_mods,
            get_metadata_from_workshop_ids,
            get_subscribed_items,
            get_public_steam_user_data,
            setup_symlinks,
            delete_symlinks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    callback_thread
        .join()
        .expect("Failed to join callback thread");
}
