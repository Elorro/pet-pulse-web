"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestProfilePhotoUploadAction } from "@/lib/profile/actions";
import { validateImage } from "@/lib/posts/media";
import type { ImageContentType } from "@/lib/posts/actions";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/auth/actions";

type ProfileFormProps = {
  username: string;
  fullName: string | null;
  photoUrl: string | null;
  userId: string;
};

const initialState: ProfileActionState = {};

export function ProfileForm({
  username,
  fullName,
  photoUrl,
  userId,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrlDraft, setPhotoUrlDraft] = useState(photoUrl ?? "");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview],
  );

  const initials = (fullName || username).slice(0, 2).toUpperCase();

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      event.target.value = "";
      toast.error(validationError);
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setSelectedPhoto(file);
  }

  function removePhoto() {
    setPhotoPreview(null);
    setSelectedPhoto(null);
    setPhotoUrlDraft("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    if (!selectedPhoto) return;

    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    try {
      const uploadRequest = await requestProfilePhotoUploadAction(
        selectedPhoto.type as ImageContentType,
      );
      if ("error" in uploadRequest) {
        toast.error(uploadRequest.error);
        return;
      }

      const uploadResponse = await fetch(uploadRequest.uploadUrl, {
        method: "PUT",
        body: selectedPhoto,
        headers: {
          "content-type": selectedPhoto.type,
          "x-upsert": "false",
        },
      });
      if (!uploadResponse.ok) {
        toast.error("The photo could not be uploaded. Please try again.");
        return;
      }

      const formData = new FormData(form);
      formData.set("photo_url", uploadRequest.publicUrl);
      setPhotoUrlDraft(uploadRequest.publicUrl);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      startTransition(() => formAction(formData));
    } catch {
      toast.error("The photo could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="grid gap-5" onSubmit={submitProfile}>
      <div className="flex items-center gap-4">
        <Avatar className="size-16" size="lg">
          {photoPreview || photoUrlDraft ? (
            <AvatarImage
              alt="Profile photo"
              src={photoPreview || photoUrlDraft}
            />
          ) : null}
          <AvatarFallback seed={userId}>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={selectPhoto}
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={pending || uploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
            variant="outline"
          >
            <ImageIcon aria-hidden="true" />
            Choose photo
          </Button>
          {photoUrlDraft || photoPreview ? (
            <Button
              disabled={pending || uploading}
              onClick={removePhoto}
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
              Remove
            </Button>
          ) : null}
          <p className="text-muted-foreground basis-full text-xs">
            JPEG, PNG, WebP, or GIF up to 5 MB. Your photo appears on your
            profile and posts.
          </p>
        </div>
        <input name="photo_url" type="hidden" value={photoUrlDraft} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          autoComplete="name"
          defaultValue={fullName ?? ""}
          id="full_name"
          maxLength={120}
          name="full_name"
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          autoComplete="username"
          defaultValue={username}
          id="username"
          maxLength={50}
          minLength={3}
          name="username"
          pattern="[A-Za-z0-9_]{3,50}"
          required
        />
        <p className="text-muted-foreground text-xs">
          Use 3–50 letters, numbers, or underscores. Your public profile URL
          uses this name.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button disabled={pending || uploading} type="submit">
          {uploading
            ? "Uploading photo…"
            : pending
              ? "Saving…"
              : "Save changes"}
        </Button>
        {state.success ? (
          <span aria-live="polite" className="text-muted-foreground text-sm">
            {state.success}
          </span>
        ) : null}
      </div>
    </form>
  );
}
