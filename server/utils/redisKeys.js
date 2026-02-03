export const RedisKeys = {
  userProfile: (userId) => `user:profile:${userId}`,
  tokenBlacklist: (tokenId) => `token:blacklist:${tokenId}`,
};
