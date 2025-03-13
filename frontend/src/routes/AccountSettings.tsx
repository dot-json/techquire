import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Camera, Save } from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const AccountSettings = () => {
  const { id, username, email, loading } = useSelector(
    (state: RootState) => state.user,
  );

  if (id === -1 && !loading) {
    console.log(id);
    return <Navigate to="/login" replace />;
  }

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
        <div className={cn("flex flex-col sm:gap-2")}>
          <h2 className={cn("text-2xl sm:text-3xl")}>Profile Picture</h2>
          <p className={cn("text-sm text-text-500 sm:text-base")}>
            Update your profile picture. This will be displayed on your profile.
          </p>
        </div>
        <div className={cn("flex items-center gap-8")}>
          <img
            src="https://placehold.co/400x400"
            alt="profile_pic"
            className={cn("size-24 rounded-full border sm:size-32")}
          />
          <div className={cn("flex flex-col gap-2")}>
            <Button className="w-fit">
              <Camera size={20} />
              Upload new picture
            </Button>
            <p className={cn("text-sm text-text-500 sm:text-base")}>
              Recommended: Square JPG, PNG, maximum 500x500 pixels.
            </p>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 sm:gap-6 sm:p-6",
        )}
      >
        <div className={cn("flex flex-col sm:gap-2")}>
          <h2 className={cn("text-2xl sm:text-3xl")}>Profile Information</h2>
          <p className={cn("text-sm text-text-500 sm:text-base")}>
            Update your username.
          </p>
        </div>
        <Input
          placeholder={username}
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
      </div>
    </div>
  );
};

export default AccountSettings;
