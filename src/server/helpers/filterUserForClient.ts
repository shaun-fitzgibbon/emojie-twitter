import { type User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (
  user: User,
): Pick<User, "id" | "username" | "imageUrl"> => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};
