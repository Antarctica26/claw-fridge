import type {
  IceBoxBackupMode,
  IceBoxListItem,
  IceBoxScheduledBackupConfig,
  IceBoxSkillConfig,
  IceBoxStatus,
  IceBoxSyncStatus,
} from "@/types";

export interface BuildSkillLinkOptions {
  mode?: "backup" | "restore";
  includeGitCredentials?: boolean;
  gitUsername?: string | null;
  gitToken?: string | null;
  gitPrivateKeyPath?: string | null;
}

export function createDefaultScheduledBackupConfig(timezone?: string): IceBoxScheduledBackupConfig {
  return {
    enabled: false,
    preset: "daily",
    time: "03:00",
    dayOfWeek: 1,
    dayOfMonth: 1,
    cronExpression: "0 3 * * *",
    timezone: timezone?.trim() || "Asia/Shanghai",
  };
}

export function normalizeScheduledBackupConfig(config: Partial<IceBoxScheduledBackupConfig> | null | undefined): IceBoxScheduledBackupConfig {
  const fallback = createDefaultScheduledBackupConfig(config?.timezone);

  return {
    enabled: config?.enabled === true,
    preset:
      config?.preset === "daily" ||
      config?.preset === "weekly" ||
      config?.preset === "monthly" ||
      config?.preset === "custom-cron"
        ? config.preset
        : fallback.preset,
    time: typeof config?.time === "string" && /^\d{2}:\d{2}$/.test(config.time) ? config.time : fallback.time,
    dayOfWeek:
      typeof config?.dayOfWeek === "number" && Number.isFinite(config.dayOfWeek)
        ? Math.min(7, Math.max(1, Math.round(config.dayOfWeek)))
        : fallback.dayOfWeek,
    dayOfMonth:
      typeof config?.dayOfMonth === "number" && Number.isFinite(config.dayOfMonth)
        ? Math.min(28, Math.max(1, Math.round(config.dayOfMonth)))
        : fallback.dayOfMonth,
    cronExpression:
      typeof config?.cronExpression === "string" && config.cronExpression.trim()
        ? config.cronExpression.trim()
        : fallback.cronExpression,
    timezone: typeof config?.timezone === "string" && config.timezone.trim() ? config.timezone.trim() : fallback.timezone,
  };
}

export function buildScheduledBackupDescription(config: IceBoxScheduledBackupConfig) {
  if (!config.enabled) {
    return "未启用";
  }

  if (config.preset === "daily") {
    return `每天 ${config.time}（${config.timezone}）`;
  }

  if (config.preset === "weekly") {
    return `每周${["一", "二", "三", "四", "五", "六", "日"][config.dayOfWeek - 1]} ${config.time}（${config.timezone}）`;
  }

  if (config.preset === "monthly") {
    return `每月 ${config.dayOfMonth} 日 ${config.time}（${config.timezone}）`;
  }

  return `自定义 Cron：${config.cronExpression}（${config.timezone}）`;
}

const statusMeta: Record<IceBoxStatus, { label: string; description: string }> = {
  healthy: {
    label: "运行正常",
    description: "最近一次备份已完成，当前状态稳定。",
  },
  syncing: {
    label: "同步中",
    description: "正在执行备份或等待最新快照写入。",
  },
  attention: {
    label: "需要关注",
    description: "最近一次备份异常，建议尽快检查。",
  },
};

const syncStatusMeta: Record<
  IceBoxSyncStatus,
  {
    label: string;
    shortLabel: string;
    description: string;
    tone: "success" | "warning" | "error" | "info";
  }
> = {
  synced: {
    label: "已同步到远端",
    shortLabel: "远端已同步",
    description: "当前冰盒记录已通过远端 fridge-config 分支回读校验。",
    tone: "success",
  },
  "pending-sync": {
    label: "等待远端校验",
    shortLabel: "待校验",
    description: "本地记录已保留，但还没有通过远端 fridge-config 分支的存在性校验。",
    tone: "warning",
  },
  "sync-failed": {
    label: "远端校验失败",
    shortLabel: "校验失败",
    description: "冰盒已经创建到本地，但最近一次写入或回读远端 fridge-config 分支未通过校验。",
    tone: "error",
  },
};

function toTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  return new Date(value).getTime();
}

const backupModeMeta: Record<IceBoxBackupMode, { label: string; description: string }> = {
  "git-branch": {
    label: "Git 直推",
    description: "OpenClaw 直接把 .openclaw 同步到专属分支。",
  },
  "upload-token": {
    label: "压缩包上传",
    description: "OpenClaw 打包后上传到冰盒专属地址，由 Claw-Fridge 接手落盘。",
  },
};

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function getIceBoxStatusMeta(status: IceBoxStatus) {
  return statusMeta[status];
}

export function getIceBoxSyncStatusMeta(syncStatus: IceBoxSyncStatus) {
  return syncStatusMeta[syncStatus];
}

export function getIceBoxBackupModeMeta(backupMode: IceBoxBackupMode) {
  return backupModeMeta[backupMode];
}

export function buildUploadUrl(origin: string, uploadPath: string | null) {
  if (!uploadPath) {
    return null;
  }

  try {
    return new URL(uploadPath, origin).toString();
  } catch {
    return null;
  }
}

export function buildSkillLink(origin: string, skillConfig: IceBoxSkillConfig, options?: BuildSkillLinkOptions) {
  const params = new URLSearchParams();

  params.set("config", JSON.stringify(skillConfig));

  if (options?.mode === "restore") {
    params.set("mode", "restore");
  }

  if (options?.includeGitCredentials) {
    params.set("includeGitCredentials", "1");

    if (options.gitUsername?.trim()) {
      params.set("gitUsername", options.gitUsername.trim());
    }

    if (options.gitToken?.trim()) {
      params.set("gitToken", options.gitToken.trim());
    }

    if (options.gitPrivateKeyPath?.trim()) {
      params.set("gitPrivateKeyPath", options.gitPrivateKeyPath.trim());
    }
  }

  return `${origin}/skill?${params.toString()}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export function formatLastBackupTime(value: string | null) {
  if (!value) {
    return "尚未执行备份";
  }

  return formatDateTime(value);
}

export async function fetchIceBoxesSnapshot(items: IceBoxListItem[]): Promise<IceBoxListItem[]> {
  await delay(450);

  return [...items].sort((left, right) => {
    const rightTimestamp = toTimestamp(right.lastBackupAt) || toTimestamp(right.createdAt);
    const leftTimestamp = toTimestamp(left.lastBackupAt) || toTimestamp(left.createdAt);

    return rightTimestamp - leftTimestamp;
  });
}
