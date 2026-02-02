// 图标数据
import mdiData from '@iconify-json/mdi/icons.json';
import materialSymbolsData from '@iconify-json/material-symbols/icons.json';
import fluentData from '@iconify-json/fluent/icons.json';

// 获取所有图标名称列表
export function getAllIcons() {
  const allIcons = [];
  
  // MDI 图标
  const mdiIcons = Object.keys(mdiData.icons);
  allIcons.push(...mdiIcons.map(name => ({
    name: `mdi:${name}`,
    label: name,
    prefix: 'mdi'
  })));
  
  // Material Symbols 图标
  const msIcons = Object.keys(materialSymbolsData.icons);
  allIcons.push(...msIcons.map(name => ({
    name: `material-symbols:${name}`,
    label: name,
    prefix: 'material-symbols'
  })));
  
  // Fluent 图标
  const fluentIcons = Object.keys(fluentData.icons);
  allIcons.push(...fluentIcons.map(name => ({
    name: `fluent:${name}`,
    label: name,
    prefix: 'fluent'
  })));
  
  return allIcons;
}

// 搜索图标
export function searchIcons(query) {
  if (!query) return [];
  
  const lowercaseQuery = query.toLowerCase();
  const allIcons = getAllIcons();
  
  return allIcons.filter(icon => 
    icon.label.toLowerCase().includes(lowercaseQuery)
  );
}

// 常用图标
export const commonIcons = [
  'mdi:home', 'mdi:google', 'mdi:youtube', 'mdi:github', 
  'mdi:twitter', 'mdi:instagram', 'mdi:facebook', 'mdi:linkedin',
  'mdi:twitch', 'mdi:discord', 'mdi:reddit', 'mdi:spotify',
  'mdi:netflix', 'mdi:amazon', 'mdi:shopping', 'mdi:cart',
  'mdi:email', 'mdi:calendar', 'mdi:clock', 'mdi:map',
  'mdi:cloud', 'mdi:folder', 'mdi:file', 'mdi:cog',
  'mdi:code-tags', 'mdi:laptop', 'mdi:controller', 'mdi:school',
  'mdi:bank', 'mdi:chart-line', 'mdi:weather-sunny', 'mdi:weather-night',
  'mdi:pencil', 'mdi:delete', 'mdi:plus', 'mdi:minus'
];
