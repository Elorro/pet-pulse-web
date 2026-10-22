"use client";

import Link from "next/link";
import { ImageIcon, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  createPostCommentAction,
  requestCommentMediaUploadAction,
  type ImageContentType,
  type PostComment,
  type PostCommentActionState,
} from "@/lib/posts/actions";
import { validateImage } from "@/lib/posts/media";

type SelectedImage = { file: File; previewUrl: string };

type PostCommentsProps = {
  postId: string;
  initialComments: PostComment[];
  isAuthenticated: boolean;
  loadError?: string;
};

export function PostComments({
  postId,
  initialComments,
  isAuthenticated,
  loadError,
}: PostCommentsProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [mediaPath, setMediaPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<PostCommentActionState>({});
  const [pending, startAction] = useTransition();
  const returnTo = `/post/${postId}`;
  const comments = useMemo(() => {
    if (
      !state.comment ||
      initialComments.some((comment) => comment.id === state.comment?.id)
    ) {
      return initialComments;
    }
    return [...initialComments, state.comment];
  }, [initialComments, state.comment]);

  useEffect(() => {
    if (state.unauthorized)
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
  }, [returnTo, router, state]);

  useEffect(
    () => () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    },
    [selectedImage],
  );

  const busy = pending || uploading;

  function clearImage() {
    setSelectedImage(null);
    setMediaPath("");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseImage(file?: File) {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      clearImage();
      setUploadError(validationError);
      return;
    }
    setUploadError("");
    setMediaPath("");
    setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!content.trim() && !selectedImage) return;
    setUploadError("");
    setState({});

    if (selectedImage) {
      setUploading(true);
      try {
        const uploadRequest = mediaPath
          ? { path: mediaPath }
          : await requestCommentMediaUploadAction(
              selectedImage.file.type as ImageContentType,
              selectedImage.file.size,
            );
        if ("unauthorized" in uploadRequest) {
          router.push(`/login?next=${encodeURIComponent(returnTo)}`);
          return;
        }
        if ("error" in uploadRequest) {
          setUploadError(uploadRequest.error);
          return;
        }

        const path = uploadRequest.path;
        if ("uploadUrl" in uploadRequest) {
          const response = await fetch(uploadRequest.uploadUrl, {
            method: "PUT",
            body: selectedImage.file,
            headers: {
              "content-type": selectedImage.file.type,
              "x-upsert": "false",
            },
          });
          if (!response.ok) {
            setUploadError(
              "The image could not be uploaded. Please try again.",
            );
            return;
          }
          setMediaPath(path);
        }
        formData.set("media_path", path);
      } catch {
        setUploadError("The image could not be uploaded. Please try again.");
        return;
      } finally {
        setUploading(false);
      }
    }

    startAction(async () => {
      const nextState = await createPostCommentAction(postId, state, formData);
      setState(nextState);
      if (nextState.comment) {
        formRef.current?.reset();
        clearImage();
        setContent("");
      }
    });
  }

  return (
    <section aria-labelledby="comments-title" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle id="comments-title">Comments</CardTitle>
          <CardDescription>
            Join the conversation with the Pet Pulse community.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isAuthenticated ? (
            <form className="grid gap-3" onSubmit={onSubmit} ref={formRef}>
              <label className="text-sm font-medium" htmlFor="comment-content">
                Your comment
              </label>
              <Textarea
                id="comment-content"
                maxLength={5000}
                name="content"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share a thoughtful comment…"
                disabled={busy}
                value={content}
              />
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={busy}
                onChange={(event) =>
                  chooseImage(event.currentTarget.files?.[0])
                }
                ref={fileInputRef}
                tabIndex={-1}
                type="file"
              />
              {selectedImage ? (
                <div className="relative w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Comment image preview"
                    className="max-h-64 max-w-full rounded-lg object-cover"
                    src={selectedImage.previewUrl}
                  />
                  <Button
                    aria-label="Remove image"
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
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <ImageIcon aria-hidden="true" />
                  Attach image or GIF
                </Button>
                <span className="text-muted-foreground text-xs">
                  JPEG, PNG, WebP, or GIF · up to 5 MB
                </span>
              </div>
              {state.error || uploadError ? (
                <p aria-live="polite" className="text-destructive text-sm">
                  {uploadError || state.error}
                </p>
              ) : null}
              <Button
                className="justify-self-start"
                disabled={busy || (!content.trim() && !selectedImage)}
                type="submit"
              >
                {uploading
                  ? "Uploading…"
                  : pending
                    ? "Posting…"
                    : "Post comment"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">
                Sign in to leave a comment.
              </p>
              <Link
                className={buttonVariants({ size: "sm" })}
                href={`/login?next=${encodeURIComponent(returnTo)}`}
              >
                Sign in
              </Link>
            </div>
          )}

          <div aria-live="polite" className="grid gap-4">
            {loadError ? (
              <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-4">
                <p className="text-destructive text-sm">{loadError}</p>
                <Button
                  className="mt-3"
                  onClick={() => router.refresh()}
                  type="button"
                  variant="outline"
                >
                  Try again
                </Button>
              </div>
            ) : comments.length ? (
              comments.map((comment) => (
                <article
                  className="border-t pt-4 first:border-0 first:pt-0"
                  key={comment.id}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium">{comment.author.username}</p>
                    <time
                      className="text-muted-foreground text-xs"
                      dateTime={comment.created_at}
                    >
                      {new Date(comment.created_at).toLocaleString()}
                    </time>
                  </div>
                  {comment.content ? (
                    <p className="text-muted-foreground mt-2 text-sm leading-6 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  ) : null}
                  {comment.media_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Image attached to the comment"
                      className="mt-3 max-h-96 max-w-full rounded-lg object-contain"
                      loading="lazy"
                      src={comment.media_url}
                    />
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-muted-foreground border-t pt-4 text-sm">
                There are no comments yet. Start the conversation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
