declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ASSETS: Fetcher;
    EPL_EDITOR_EMAILS?: string;
    CONNECTORS?: any;
    BUCKET?: R2Bucket;
  }
}
