mod accent;
mod arp;
mod discovery;
mod wol;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_m3::init())
        .invoke_handler(tauri::generate_handler![
            discovery::discover_devices,
            wol::send_wol,
            arp::lookup_ip,
            accent::get_accent_color
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
