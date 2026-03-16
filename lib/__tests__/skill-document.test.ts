import { describe, expect, it } from 'vitest'

import { buildSkillMarkdown, parseSkillConfig } from '@/lib/skill-document'

const rawConfig = {
  version: 1,
  iceBoxId: 'mini-66c2f2',
  iceBoxName: 'Mini Ice Box',
  machineId: 'mini',
  backupMode: 'git-branch',
  repository: 'https://github.com/example/repo.git',
  branch: 'ice-box/mini-66c2f2',
  gitAuthMethod: 'https-token',
  gitUsername: 'claw',
  uploadPath: null,
  uploadToken: null,
  scheduledBackup: {
    enabled: true,
    preset: 'daily',
    time: '04:30',
    timezone: 'Asia/Shanghai',
  },
  encryption: {
    enabled: false,
  },
  filter: {
    mode: 'whitelist',
    presets: ['essential'],
    inheritGitignore: false,
    patterns: [
      { pattern: 'workspace/custom/**', type: 'glob', description: '额外保留' },
      { pattern: '^notes/.+$', type: 'regex', description: '笔记目录' },
    ],
  },
  createdAt: '2026-03-16T00:00:00.000Z',
}

describe('skill-document filter support', () => {
  it('parseSkillConfig 正确解析 filter 字段', () => {
    const config = parseSkillConfig(rawConfig)

    expect(config.filter).toEqual({
      mode: 'whitelist',
      presets: ['essential'],
      inheritGitignore: false,
      patterns: [
        { pattern: 'workspace/custom/**', type: 'glob', description: '额外保留' },
        { pattern: '^notes/.+$', type: 'regex', description: '笔记目录' },
      ],
    })
    expect(config.scheduledBackup.enabled).toBe(true)
    expect(config.encryption.enabled).toBe(false)
  })

  it('buildSkillMarkdown 包含 filter 相关内容', () => {
    const config = parseSkillConfig(rawConfig)
    const markdown = buildSkillMarkdown(config, 'https://example.com')

    expect(markdown).toContain('filter-mode: `whitelist`')
    expect(markdown).toContain('filter-presets: essential')
    expect(markdown).toContain('## 备份过滤规则')
    expect(markdown).toContain('- [glob] `workspace/custom/**` — 额外保留')
    expect(markdown).toContain('- [regex] `^notes/.+$` — 笔记目录')
  })
})
