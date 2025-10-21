use std::time::Duration;

use libarp::{client::ArpClient, interfaces::MacAddr};
use tauri::command;

#[command]
pub async fn lookup_ip(mac: String) -> Result<String, String> {
    let mut client = ArpClient::new().map_err(|e| e.to_string())?;

    let mac_u8 = mac_to_u8(&mac).map_err(|e| e.to_string())?;

    let result = client
        .mac_to_ip(
            MacAddr::new(
                mac_u8[0], mac_u8[1], mac_u8[2], mac_u8[3], mac_u8[4], mac_u8[5],
            ),
            Some(Duration::from_secs(5)),
        )
        .await
        .map_err(|e| e.to_string())?;

    println!("Simple: IP for MAC {} is {}", mac, result);

    Ok(result.to_string())
}

fn mac_to_u8(mac_str: &str) -> Result<[u8; 6], &str> {
    let clean_mac: String = mac_str.chars().filter(|c| c.is_ascii_hexdigit()).collect();

    if clean_mac.len() != 12 {
        return Err("Invalid MAC address length");
    }

    let mut mac_bytes = [0u8; 6];
    for i in 0..6 {
        let hex_pair = &clean_mac[i * 2..i * 2 + 2];

        match u8::from_str_radix(hex_pair, 16) {
            Ok(byte) => mac_bytes[i] = byte,
            Err(_) => return Err("Invalid MAC address"),
        }
    }

    Ok(mac_bytes)
}
