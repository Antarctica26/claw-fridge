import type { ExcludePreset, FilterPattern, IceBoxFilterConfig } from "@/types";

export const EXCLUDE_PRESETS: ExcludePreset[] = [
  {
    id: "nodejs",
    name: "Node.js",
    description: "排除 Node.js 依赖、构建产物和常见包管理缓存。",
    patterns: [
      { pattern: "node_modules/**", type: "glob", description: "Node.js 依赖目录" },
      { pattern: "dist/**", type: "glob", description: "dist 构建产物" },
      { pattern: "build/**", type: "glob", description: "build 构建产物" },
      { pattern: ".next/**", type: "glob", description: "Next.js 构建目录" },
      { pattern: "*.log", type: "glob", description: "日志文件" },
      { pattern: ".npm/**", type: "glob", description: "npm 缓存" },
      { pattern: ".yarn/cache/**", type: "glob", description: "Yarn 缓存" },
    ],
  },
  {
    id: "macos",
    name: "macOS",
    description: "排除 macOS 系统生成的无关文件。",
    patterns: [
      { pattern: ".DS_Store", type: "glob", description: "Finder 元数据" },
      { pattern: "._*", type: "glob", description: "AppleDouble 资源文件" },
      { pattern: ".Trashes/**", type: "glob", description: "废纸篓目录" },
    ],
  },
  {
    id: "sensitive",
    name: "敏感文件",
    description: "排除密钥、证书、局部环境变量和常见凭据目录。",
    patterns: [
      { pattern: "*.key", type: "glob", description: "私钥文件" },
      { pattern: "*.pem", type: "glob", description: "PEM 证书/密钥" },
      { pattern: "*.p12", type: "glob", description: "P12 证书" },
      { pattern: ".env.local", type: "glob", description: "本地环境变量" },
      { pattern: ".env.*.local", type: "glob", description: "按环境区分的本地环境变量" },
      { pattern: "**/secrets/**", type: "glob", description: "secrets 目录" },
      { pattern: "**/credentials/**", type: "glob", description: "credentials 目录" },
    ],
  },
  {
    id: "cache",
    name: "缓存",
    description: "排除常见缓存目录和缓存文件。",
    patterns: [
      { pattern: "**/cache/**", type: "glob", description: "通用 cache 目录" },
      { pattern: ".cache/**", type: "glob", description: "根目录缓存" },
      { pattern: "*.cache", type: "glob", description: "缓存文件" },
    ],
  },
  {
    id: "large",
    name: "大文件归档",
    description: "排除常见压缩包和镜像文件，减少备份体积。",
    patterns: [
      { pattern: "*.zip", type: "glob", description: "ZIP 压缩包" },
      { pattern: "*.tar.gz", type: "glob", description: "tar.gz 压缩包" },
      { pattern: "*.tar.xz", type: "glob", description: "tar.xz 压缩包" },
      { pattern: "*.dmg", type: "glob", description: "macOS 磁盘镜像" },
      { pattern: "*.iso", type: "glob", description: "ISO 镜像" },
      { pattern: "*.pkg", type: "glob", description: "安装包" },
    ],
  },
  {
    id: "logs",
    name: "日志",
    description: "排除日志文件和日志目录。",
    patterns: [
      { pattern: "*.log", type: "glob", description: "日志文件" },
      { pattern: "*.log.*", type: "glob", description: "滚动日志文件" },
      { pattern: "**/logs/**", type: "glob", description: "logs 目录" },
    ],
  },
  {
    id: "ide",
    name: "IDE 配置",
    description: "排除 IDE 临时配置和交换文件。",
    patterns: [
      { pattern: ".idea/**", type: "glob", description: "JetBrains 配置目录" },
      { pattern: ".vscode/**", type: "glob", description: "VS Code 配置目录" },
      { pattern: "*.swp", type: "glob", description: "Vim swap 文件" },
      { pattern: "*.swo", type: "glob", description: "Vim swap 文件" },
    ],
  },
  {
    id: "python",
    name: "Python",
    description: "排除 Python 缓存、虚拟环境和打包元数据。",
    patterns: [
      { pattern: "__pycache__/**", type: "glob", description: "Python 字节码缓存" },
      { pattern: "*.pyc", type: "glob", description: "Python 编译文件" },
      { pattern: ".venv/**", type: "glob", description: "隐藏虚拟环境" },
      { pattern: "venv/**", type: "glob", description: "虚拟环境目录" },
      { pattern: "*.egg-info/**", type: "glob", description: "打包元数据" },
    ],
  },
];

export const WHITELIST_PRESETS: ExcludePreset[] = [
  {
    id: "essential",
    name: "核心配置",
    description: "仅保留 OpenClaw 关键配置、记忆与技能说明文件。",
    patterns: [
      { pattern: "openclaw.json", type: "glob", description: "主配置文件" },
      { pattern: "config.json", type: "glob", description: "通用配置文件" },
      { pattern: "workspace/MEMORY.md", type: "glob", description: "长期记忆" },
      { pattern: "workspace/AGENTS.md", type: "glob", description: "代理工作规范" },
      { pattern: "workspace/SOUL.md", type: "glob", description: "人格设定" },
      { pattern: "workspace/USER.md", type: "glob", description: "用户资料" },
      { pattern: "workspace/TOOLS.md", type: "glob", description: "本地工具说明" },
      { pattern: "workspace/IDENTITY.md", type: "glob", description: "身份信息" },
      { pattern: "skills/*/SKILL.md", type: "glob", description: "技能主说明文件" },
    ],
  },
  {
    id: "no-skills",
    name: "排除技能目录",
    description: "保留除 skills 目录外的全部内容。",
    patterns: [
      {
        pattern: "^(?!skills(?:/|$)).+",
        type: "regex",
        description: "匹配所有不在 skills 目录内的路径",
      },
    ],
  },
];

export function expandPresets(presetIds: string[], presets: ExcludePreset[]): FilterPattern[] {
  const selectedPresetIds = new Set(presetIds);
  const expanded: FilterPattern[] = [];
  const seen = new Set<string>();

  for (const preset of presets) {
    if (!selectedPresetIds.has(preset.id)) {
      continue;
    }

    for (const pattern of preset.patterns) {
      const key = `${pattern.type}:${pattern.pattern}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      expanded.push(pattern);
    }
  }

  return expanded;
}

export function getExcludePresets(): ExcludePreset[] {
  return EXCLUDE_PRESETS.map((preset) => ({
    ...preset,
    patterns: preset.patterns.map((pattern) => ({ ...pattern })),
  }));
}

export function getWhitelistPresets(): ExcludePreset[] {
  return WHITELIST_PRESETS.map((preset) => ({
    ...preset,
    patterns: preset.patterns.map((pattern) => ({ ...pattern })),
  }));
}

export function getDefaultFilterConfig(): IceBoxFilterConfig {
  return {
    mode: "blacklist",
    patterns: [],
    presets: ["nodejs", "macos", "sensitive", "cache", "large", "logs", "ide", "python"],
    inheritGitignore: true,
  };
}
