use futures::stream::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use ssdp_client::{SearchTarget, URN};
use std::time::Duration;
use url::Url;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SonyResult {
    model_name: String,
    product_category: String,
    product_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SonyResponse {
    result: Vec<SonyResult>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    id: String,
    display_name: String,
    product: String,
    model: String,
    hostname: String,
}

async fn try_sony_post(client: &Client, ip: &str) -> Option<SonyResponse> {
    let url = format!("http://{}/sony/system", ip);
    let body = serde_json::json!({
        "method": "getInterfaceInformation",
        "id": 33,
        "params": [],
        "version": "1.0"
    });

    let resp = client.post(&url).json(&body).send().await.ok()?;
    let text = resp.text().await.ok()?;
    serde_json::from_str::<SonyResponse>(&text).ok()
}

#[tauri::command]
pub async fn discover_devices(timeout: Option<u32>) -> Result<Vec<Device>, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .pool_max_idle_per_host(10)
        .build()
        .unwrap();

    let search_target = SearchTarget::URN(URN::service("schemas-sony-com", "ScalarWebAPI", 1));
    let responses = match ssdp_client::search(
        &search_target,
        Duration::from_secs(timeout.unwrap_or(5) as u64),
        2,
        None,
    )
    .await
    {
        Ok(stream) => stream,
        Err(e) => {
            eprintln!("Error during SSDP search: {}", e);
            return Err("Failed to start SSDP search".to_string());
        }
    };

    let responses: Vec<_> = responses
        .take_while(|res| futures::future::ready(res.is_ok()))
        .collect()
        .await;

    // print out the responses for debugging
    for response in &responses {
        match response {
            Ok(resp) => println!("Found device: {}", resp.location()),
            Err(e) => eprintln!("Error in response: {}", e),
        }
    }

    let mut devices = Vec::new();

    for response in responses {
        if let Ok(resp) = response {
            let ip = Url::parse(resp.location())
                .and_then(|url| Ok(url.host_str().unwrap_or("").to_string()));

            if let Ok(ip) = ip {
                if let Some(sony_resp) = try_sony_post(&client, &ip).await {
                    for result in sony_resp.result {
                        let device = Device {
                            id: format!("{}-{}", ip, result.model_name),
                            display_name: format!("{} {}", result.product_name, result.model_name),
                            product: result.product_category,
                            model: result.model_name,
                            hostname: ip.to_string(),
                        };
                        devices.push(device);
                    }
                }
            }
        }
    }

    Ok(devices)
}
