use std::process::Command;
use tauri::command;

#[command]
pub fn get_accent_color() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .arg("-Command")
            .arg("[Console]::WindowTitle = 'Get-ItemProperty -Path HKCU
            \\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize | Select-Object -ExpandProperty AccentColor'")
            .output()
            .map_err(|e| e.to_string())?;
        if output.status.success() {
            let hex = String::from_utf8_lossy(&output.stdout);
            let hex = hex.trim().trim_start_matches("0x");
            let r = &hex[4..6];
            let g = &hex[2..4];
            let b = &hex[0..2];
            Ok(format!("#{}{}{}", r, g, b))
        } else {
            Err("Failed to get accent color".into())
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to get the value of the first color of the first appearance preferences")
            .output()
            .map_err(|e| e.to_string())?;
        if output.status.success() {
            let rgb = String::from_utf8_lossy(&output.stdout);
            let rgb: Vec<&str> = rgb.trim().split(", ").collect();
            if rgb.len() == 3 {
                let r = format!(
                    "{:02X}",
                    rgb[0].parse::<u8>().map_err(|_| "Invalid RGB value")?
                );
                let g = format!(
                    "{:02X}",
                    rgb[1].parse::<u8>().map_err(|_| "Invalid RGB value")?
                );
                let b = format!(
                    "{:02X}",
                    rgb[2].parse::<u8>().map_err(|_| "Invalid RGB value")?
                );
                Ok(format!("#{}{}{}", r, g, b))
            } else {
                Err("Unexpected RGB format".into())
            }
        } else {
            Err("Failed to get accent color".into())
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Try GNOME (gsettings) first
        if let Ok(output) = Command::new("gsettings")
            .arg("get")
            .arg("org.gnome.desktop.interface")
            .arg("accent-color")
            .output()
        {
            if output.status.success() {
                let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
                let cleaned = raw.trim_matches(|c| c == '\'' || c == '"').to_string();

                if !cleaned.is_empty() && !cleaned.contains("No such schema") {
                    return Ok(cleaned);
                }
            }
        }

        // Fallback: KDE
        if let Ok(output) = Command::new("kreadconfig5")
            .arg("--file")
            .arg("kdeglobals")
            .arg("--group")
            .arg("General")
            .arg("--key")
            .arg("AccentColor")
            .output()
        {
            if output.status.success() {
                let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !raw.is_empty() {
                    let parts: Vec<&str> = raw.split(',').collect();
                    if parts.len() == 3 {
                        let parse = |s: &str| s.trim().parse::<u8>();
                        if let (Ok(r), Ok(g), Ok(b)) =
                            (parse(parts[0]), parse(parts[1]), parse(parts[2]))
                        {
                            return Ok(format!("#{:02X}{:02X}{:02X}", r, g, b));
                        }
                    }
                }
            }
        }

        Err("Failed to get accent color".into())
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Unsupported OS".into())
    }
}
