export interface ParsedVideoSource {
  type: "iframe" | "video";
  src: string;
}

const directVideoPattern = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i;

export function getVideoSource(rawUrl: string | undefined): ParsedVideoSource | null {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace("www.", "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` } : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` } : null;
      }

      if (url.pathname.startsWith("/embed/")) {
        return { type: "iframe", src: `https://www.youtube.com${url.pathname}` };
      }

      if (url.pathname.startsWith("/shorts/")) {
        const videoId = url.pathname.split("/").filter(Boolean)[1];
        return videoId ? { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` } : null;
      }
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const candidateId = pathParts[pathParts.length - 1];
      if (candidateId && /^\d+$/.test(candidateId)) {
        return { type: "iframe", src: `https://player.vimeo.com/video/${candidateId}` };
      }
    }

    if (directVideoPattern.test(url.pathname)) {
      return { type: "video", src: rawUrl };
    }
  } catch {
    return null;
  }

  if (directVideoPattern.test(rawUrl)) {
    return { type: "video", src: rawUrl };
  }

  return null;
}

export function getYoutubeEmbedUrl(rawUrl: string | undefined): string | null {
  const parsed = getVideoSource(rawUrl);
  if (!parsed || parsed.type !== "iframe") return null;
  return parsed.src;
}
