use std::net::{SocketAddr, TcpStream};
use std::time::Duration;

pub const SOCKS_PORT: u16 = 1819;

pub fn socks_addr() -> SocketAddr {
    SocketAddr::from(([127, 0, 0, 1], SOCKS_PORT))
}

/// Ground-truth "are we connected" signal: try to open a TCP connection to
/// Aether's local SOCKS5 port. This is immune to Aether changing its log
/// wording across releases, which is the actual fragility PTY-automation
/// accepts (see the approved plan) — log-line matching is only ever used to
/// fail fast / show a nicer message, never as the sole source of truth.
pub fn port_is_live() -> bool {
    TcpStream::connect_timeout(&socks_addr(), Duration::from_millis(300)).is_ok()
}

/// Empirically (manually running v1.0.1 to completion), Aether's own route-
/// discovery budget goes up to 120s for MASQUE and 80s for WireGuard (its
/// own "budget=..." log line). The GUI's connect timeout must exceed both,
/// or it would fire while Aether is still legitimately scanning for a route.
pub const CONNECT_TIMEOUT: Duration = Duration::from_secs(150);

/// How long to wait after sending Ctrl-C before force-killing. Manually
/// testing shutdown against the real binary showed it does NOT exit quickly
/// on SIGINT (still alive 10+ seconds later) — but since v1 never elevates
/// or opens a TUN device, there is nothing at the OS level a hard kill would
/// leave dangling, so a short grace period followed by SIGKILL is the
/// expected common path here, not a rare fallback.
pub const GRACEFUL_SHUTDOWN_GRACE: Duration = Duration::from_secs(3);
