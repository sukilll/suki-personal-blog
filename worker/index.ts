import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

async function serveDesktop(request: Request, env: Env): Promise<Response> {
  const requestUrl = new URL(request.url);
  const assetUrl = new URL("/index.html", request.url);
  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
  const html = (await assetResponse.text()).replaceAll("__SITE_ORIGIN__", requestUrl.origin);
  const headers = new Headers(assetResponse.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(html, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return serveDesktop(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES
            .input(body)
            .transform(width > 0 ? { width } : {})
            .output({ format, quality });
          return result.response();
        }
      }, allowedWidths);
    }

    if (
      url.pathname === "/styles.css" ||
      url.pathname === "/app.js" ||
      url.pathname.startsWith("/assets/")
    ) {
      return env.ASSETS.fetch(request);
    }

    return handler.fetch(request, env, ctx);
  }
};

export default worker;
