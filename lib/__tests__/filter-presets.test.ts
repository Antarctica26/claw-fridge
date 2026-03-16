import { describe, expect, it } from 'vitest'

import {
  EXCLUDE_PRESETS,
  WHITELIST_PRESETS,
  expandPresets,
  getDefaultFilterConfig,
  getExcludePresets,
  getWhitelistPresets,
} from '@/lib/filter-presets'

describe('filter presets', () => {
  it('getDefaultFilterConfig 返回正确的默认值', () => {
    expect(getDefaultFilterConfig()).toEqual({
      mode: 'blacklist',
      patterns: [],
      presets: ['nodejs', 'macos', 'sensitive', 'cache', 'large', 'logs', 'ide', 'python'],
      inheritGitignore: true,
    })
  })

  it('getExcludePresets 返回所有黑名单预设，并且是深拷贝', () => {
    const presets = getExcludePresets()

    expect(presets).toEqual(EXCLUDE_PRESETS)
    expect(presets).not.toBe(EXCLUDE_PRESETS)
    expect(presets[0]).not.toBe(EXCLUDE_PRESETS[0])
    expect(presets[0].patterns[0]).not.toBe(EXCLUDE_PRESETS[0].patterns[0])
  })

  it('getWhitelistPresets 返回所有白名单预设，并且是深拷贝', () => {
    const presets = getWhitelistPresets()

    expect(presets).toEqual(WHITELIST_PRESETS)
    expect(presets).not.toBe(WHITELIST_PRESETS)
    expect(presets[0]).not.toBe(WHITELIST_PRESETS[0])
    expect(presets[0].patterns[0]).not.toBe(WHITELIST_PRESETS[0].patterns[0])
  })

  it('expandPresets 正确展开预设为 patterns，并按 type+pattern 去重', () => {
    const expanded = expandPresets(['nodejs', 'logs'], EXCLUDE_PRESETS)

    expect(expanded).toContainEqual({ pattern: 'node_modules/**', type: 'glob', description: 'Node.js 依赖目录' })
    expect(expanded).toContainEqual({ pattern: '*.log.*', type: 'glob', description: '滚动日志文件' })

    const logPatterns = expanded.filter((item) => item.pattern === '*.log' && item.type === 'glob')
    expect(logPatterns).toHaveLength(1)
  })
})
