use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;

// fun error handling stuff
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SeverityKind {
    Info,
    Warning,
    Error,
    Fatal,
}

impl TryFrom<u8> for SeverityKind {
    type Error = u8;
    fn try_from(val: u8) -> Result<SeverityKind, u8> {
        match val {
            x if x == SeverityKind::Info as u8 => Ok(SeverityKind::Info),
            x if x == SeverityKind::Warning as u8 => Ok(SeverityKind::Warning),
            x if x == SeverityKind::Error as u8 => Ok(SeverityKind::Error),
            x if x == SeverityKind::Fatal as u8 => Ok(SeverityKind::Fatal),
            x => Err(x),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Event<M: serde::ser::Serialize, S: serde::ser::Serialize> {
    pub msg: M,
    pub source: S,
    pub severity: SeverityKind,
}

pub fn log<M, S>(e: Event<M, S>)
where
    M: serde::ser::Serialize,
    S: serde::ser::Serialize,
{
    println!("{}", serde_json::to_string(&e).unwrap());
}

// creates a random string 16 characters long
pub fn random_string() -> String {
    let s: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();
    return s;
}
