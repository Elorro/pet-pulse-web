"use client";

import Link from "next/link";
import { ImageIcon, X } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPostAction,
  requestMediaUploadAction,
  type ImageContentType,
} from "@/lib/posts/actions";
import { validateImage } from "@/lib/posts/media";

type SelectedImage = { file: File; previewUrl: string };

export function PostComposer() {
  const [state, formAction, pending] = useActionState(createPostAction, {});
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [mediaPath, setMediaPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const busy = pending || uploading;

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(
    () => () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    },
    [selectedImage],
  );

  function clearImage() {
    setSelectedImage(null);
    setMediaPath("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseImage(file?: File) {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      clearImage();
      toast.error(validationError);
      return;
    }
    setMediaPath("");
    setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function onDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    chooseImage(event.dataTransfer.files[0]);
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const file = event.clipboardData.files[0];
    if (!file) return;
    event.preventDefault();
    chooseImage(file);
  }

  async function uploadImage(image: SelectedImage) {
    const uploadRequest = await requestMediaUploadAction(
      image.file.type as ImageContentType,
    );
    if ("error" in uploadRequest) {
      toast.error(uploadRequest.error);
      return null;
    }

    const uploadResponse = await fetch(uploadRequest.uploadUrl, {
      method: "PUT",
      body: image.file,
      headers: { "content-type": image.file.type, "x-upsert": "false" },
    });
    if (!uploadResponse.ok) {
      toast.error("The photo could not be uploaded. Please try again.");
      return null;
    }
    return uploadRequest.path;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedImage) return;

    // Submit the action ourselves: the textarea is disabled while uploading,
    // so a native re-submit would drop its value from the form data.
    event.preventDefault();
    if (!content.trim()) return;
    setUploading(true);
    try {
      // Reuse an earlier upload if a previous post attempt failed.
      const path = mediaPath || (await uploadImage(selectedImage));
      if (!path) return;
      setMediaPath(path);

      const formData = new FormData();
      formData.set("content", content);
      formData.set("media_path", path);
      startTransition(() => formAction(formData));
    } catch {
      toast.error("The photo could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card
      className={
        dragging
          ? "border-primary bg-primary/5 border-2 border-dashed"
          : undefined
      }
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes("Files"))
          event.preventDefault();
      }}
      onDrop={onDrop}
    >
      <CardHeader>
        <CardTitle>Share with the community</CardTitle>
        <CardDescription>Tell everyone what your pet is up to.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="content">Your post</Label>
            <Textarea
              disabled={busy}
              id="content"
              maxLength={5000}
              name="content"
              onChange={(event) => setContent(event.target.value)}
              onPaste={onPaste}
              placeholder="What's your pet up to?"
              required
              rows={5}
              value={content}
            />
            <p
              className="text-muted-foreground text-right text-xs"
              aria-live="polite"
            >
              {content.length} / 5000
            </p>
          </div>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => chooseImage(event.currentTarget.files?.[0])}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />
          {selectedImage ? (
            <div className="relative w-fit">
              {/* Local object URL preview. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Photo preview"
                className="max-h-64 max-w-full rounded-lg object-cover"
                src={selectedImage.previewUrl}
              />
              <Button
                aria-label="Remove photo"
                className="absolute top-2 right-2"
                disabled={busy}
                onClick={clearImage}
                size="icon-sm"
                type="button"
                variant="secondary"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <Button
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                type="button"
                variant="outline"
              >
                <ImageIcon aria-hidden="true" />
                Add photo
              </Button>
              <span>Drag a photo here or add one</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Link
              aria-disabled={busy}
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
              href="/feed"
              onClick={(event) => busy && event.preventDefault()}
            >
              Cancel
            </Link>
            <Button disabled={busy || !content.trim()} type="submit">
              {uploading ? "Uploading…" : pending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
