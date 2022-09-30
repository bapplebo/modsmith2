use std::env;
use std::fs;
use std::path::Path;
use std::path::PathBuf;

fn main() {
    println!("Copying steam dlls to target");

    let out_dir = env::var("OUT_DIR").unwrap();
    let target_dir = get_output_path();

    println!("Calculated build path: {}", out_dir);
    println!("Calculated target path: {}", target_dir.to_str().unwrap());

    fs::copy(
        Path::join(&env::current_dir().unwrap(), "lib\\steam_api64.dll"),
        Path::join(Path::new(&target_dir), Path::new("steam_api64.dll")),
    )
    .unwrap();
    fs::copy(
        Path::join(&env::current_dir().unwrap(), "lib\\steam_api.dll"),
        Path::join(Path::new(&target_dir), Path::new("steam_api.dll")),
    )
    .unwrap();
    tauri_build::build();
}

fn get_output_path() -> PathBuf {
    //<root or manifest path>/target/<profile>/
    let manifest_dir_string = env::var("CARGO_MANIFEST_DIR").unwrap();
    let build_type = env::var("PROFILE").unwrap();
    let path = Path::new(&manifest_dir_string)
        .join("target")
        .join(build_type);
    return PathBuf::from(path);
}
