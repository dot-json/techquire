import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  updatePassword,
  updateProfilePicture,
  updateUsername,
} from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Camera, Save, Loader2, ImageUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

const AccountSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id, token, username, email, profile_picture_url, loading } =
    useSelector((state: RootState) => state.user);
  const [usernameForm, setUsernameForm] = useState({ username: username });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // For file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Handle profile picture selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large (max 2MB)");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile picture upload
  const handleUploadPicture = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);

    try {
      // Optional: Resize image client-side before upload
      const resizedFile = await resizeImage(selectedFile, 500, 500);
      await dispatch(
        updateProfilePicture({ token, file: resizedFile }),
      ).unwrap();

      // Clear selection after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  // Image resizing function
  const resizeImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create new file from blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              // If resize fails, return original file
              resolve(file);
            }
          }, file.type);
        } else {
          // If context fails, return original file
          resolve(file);
        }
      };
    });
  };

  const handleUpdateUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateUsername({ token, username: usernameForm.username }));
  };

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(
      updatePassword({
        token,
        password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      }),
    );
  };

  useEffect(() => {
    setUsernameForm({ username });
  }, [username]);

  if (id === -1 && !loading) {
    console.log(id);
    return <Navigate to="/login" replace />;
  }

  // Display either preview or current profile picture
  const profileImageUrl =
    previewUrl ||
    (profile_picture_url
      ? `${import.meta.env.VITE_SERVICE_URL}${profile_picture_url}`
      : "https://www.gravatar.com/avatar/?d=identicon&s=400");

  return (
    <div className={cn("flex flex-col gap-4 py-4 sm:gap-8 sm:py-8")}>
      <h1 className={cn("text-3xl font-medium sm:text-4xl")}>
        Account Settings
      </h1>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 sm:gap-6 sm:p-6",
        )}
      >
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-2xl sm:text-3xl")}>Profile Picture</h2>
          <p className={cn("text-sm text-text-500 sm:text-base")}>
            Update your profile picture. This will be displayed on your profile.
          </p>
        </div>
        <div className={cn("flex flex-col items-center gap-8 sm:flex-row")}>
          <img
            src={profileImageUrl}
            alt="Profile"
            className={cn(
              "size-48 rounded-full border object-cover sm:size-32",
            )}
          />
          <div className={cn("flex w-full flex-col gap-4 sm:w-fit")}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="profile-picture-input"
            />
            <div className={cn("flex flex-col items-center gap-4 sm:flex-row")}>
              <Button
                type="button"
                className={cn("w-full sm:w-fit")}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={20} />
                Select new picture
              </Button>

              {selectedFile && (
                <Button
                  type="button"
                  className={cn("w-full sm:w-fit")}
                  onClick={handleUploadPicture}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImageUp size={20} />
                  )}
                  Upload Picture
                </Button>
              )}
            </div>

            <p className={cn("text-sm text-text-500 sm:text-base")}>
              Recommended: Square JPG, PNG, maximum 500x500 pixels.
            </p>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleUpdateUsername}
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 sm:gap-6 sm:p-6",
        )}
      >
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-2xl sm:text-3xl")}>Profile Information</h2>
          <p className={cn("text-sm text-text-500 sm:text-base")}>
            Update your username.
          </p>
        </div>
        <Input
          placeholder={username}
          value={usernameForm.username}
          onChange={(e) => setUsernameForm({ username: e.target.value })}
          label="Username"
          description="This is your public display name."
        />
        <Input
          placeholder={email}
          label="Email"
          value={email}
          disabled
          description="This is the email address associated with your account."
        />
        <Button className={cn("w-fit")}>
          <Save size={20} />
          Save changes
        </Button>
      </form>
      <form
        onSubmit={handleUpdatePassword}
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 sm:gap-6 sm:p-6",
        )}
      >
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-2xl sm:text-3xl")}>Profile Security</h2>
          <p className={cn("text-sm text-text-500 sm:text-base")}>
            Update your password.
          </p>
        </div>
        <Input
          type="password"
          label="Current Password"
          description="Enter your current password."
          value={passwordForm.currentPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              currentPassword: e.target.value,
            })
          }
        />
        <Input
          type="password"
          label="New Password"
          description="Enter your new password."
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
          }
        />
        <Input
          type="password"
          label="Confirm New Password"
          description="Re-enter your new password."
          value={passwordForm.confirmNewPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              confirmNewPassword: e.target.value,
            })
          }
        />
        <Button className={cn("w-fit")}>
          <Save size={20} />
          Save changes
        </Button>
      </form>
    </div>
  );
};

export default AccountSettings;
