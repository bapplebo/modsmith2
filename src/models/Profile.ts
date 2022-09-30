export interface Profile {
  Name: string;
  Mods: ProfileMod[];
}

export interface ProfileMod {
  Name: string;
  Filename: string;
}
