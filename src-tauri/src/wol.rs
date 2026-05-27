use tauri::command;
use tokio::net::UdpSocket;

#[command]
pub async fn send_wol(mac: String) -> Result<(), String> {
    let mac_bytes = parse_mac(&mac).map_err(|e| e.to_string())?;
    let mut packet = vec![0xFFu8; 6];
    for _ in 0..16 {
        packet.extend_from_slice(&mac_bytes);
    }
    let socket = UdpSocket::bind("0.0.0.0:0")
        .await
        .map_err(|e| e.to_string())?;
    socket.set_broadcast(true).map_err(|e| e.to_string())?;
    socket
        .send_to(&packet, "255.255.255.255:9")
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn parse_mac(mac: &str) -> Result<[u8; 6], &'static str> {
    let parts: Vec<&str> = mac.split(|c| c == ':' || c == '-').collect();
    if parts.len() != 6 {
        return Err("Invalid MAC address format");
    }
    let mut bytes = [0u8; 6];
    for (i, part) in parts.iter().enumerate() {
        bytes[i] = u8::from_str_radix(part, 16).map_err(|_| "Invalid MAC address")?;
    }
    Ok(bytes)
}
