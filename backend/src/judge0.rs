use std::collections::HashMap;
use std::io::Write;

use reqwest::Client;
use serde::{Deserialize, Serialize};

use super::response;

use super::handlers::report_io_err;
use super::handlers::report_zip_err;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmissionRequest {
    pub language_id: i64,
    pub additional_files: String,
    pub callback_url: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmissionRequestResponse {
    pub token: String,
}

#[derive(Clone)]
pub struct Judge0Service {
    client: Client,
    service_url: String,
}

impl Judge0Service {
    pub async fn new(service_url: &str) -> Self {
        Judge0Service {
            service_url: String::from(service_url),
            client: Client::new(),
        }
    }

    // If the ApiKey is valid, returns the user it refers to.
    // If the ApiKey is invalid or the user doesn't exist, returns an error
    pub async fn send_submission(
        &self,
        request: SubmissionRequest,
    ) -> Result<SubmissionRequestResponse, response::AppError> {
        self.client
            .post(format!("{}/submissions/?wait=false", self.service_url))
            .json(&request)
            .send()
            .await
            .map_err(|_| response::AppError::Network)?
            .json()
            .await
            .map_err(|_| response::AppError::DecodeError)?
    }

    pub async fn send_multifile_submission(
        &self,
        map: HashMap<String, String>,
        callback_url: String,
    ) -> Result<SubmissionRequestResponse, response::AppError> {
        // create zip of codes
        let zip_options =
            zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Stored);
        let mut zip = zip::ZipWriter::new(std::io::Cursor::new(vec![]));

        for (file_name, file_content) in map {
            zip.start_file(file_name, zip_options)
                .map_err(report_zip_err)?;
            zip.write(file_content.as_bytes()).map_err(report_io_err)?;
        }

        let zip_buf = zip.finish().map_err(report_zip_err)?.into_inner();

        let additional_files = base64::encode(&zip_buf);

        self.send_submission(SubmissionRequest {
            language_id: 89,
            callback_url: Some(callback_url),
            additional_files,
        })
        .await
    }
}
