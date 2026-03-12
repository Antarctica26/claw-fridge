import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// 获取 git commit hash
const getGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
};

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_GIT_COMMIT_HASH: getGitCommitHash(),
  },
};

export default nextConfig;
