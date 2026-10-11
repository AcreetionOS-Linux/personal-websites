# Digital Twin Template Pack

Based on the Sprungles Hive Mind architecture by Natalie Spiva [ by paperwork only ] & AcreetionOS.

## Templates Available

| Template | Use For |
|---|---|
| `core-twin.SKILL.md` | Primary identity/personality twins |
| `domain-expert.SKILL.md` | Technical domain specialists |
| `system-twin.SKILL.md` | Infrastructure and subsystem managers |
| `dark-twin.SKILL.md` | Strategic, unfiltered, or specialized-morality twins |
| `medical-twin.SKILL.md` | Health and medical condition twins |

## Setup Instructions

1. Choose the template that matches your twin's role
2. Replace all `[BRACKETED]` placeholders with your content
3. Save as `SKILL.md` in `~/.config/opencode/skills/[twin-name]/`
4. Create shared modules in `~/.config/opencode/skills/_shared/`
5. Register your new twin in existing twins' routing tables
6. Deploy and test

## Model Variants

Deploy on multiple backends by creating variant directories:
- `[twin-name]/SKILL.md` — primary (deepseek-v4-pro)
- `[twin-name]-edualc/SKILL.md` — claude-sonnet-4 variant
- `[twin-name]-gemini/SKILL.md` — gemini-2.5-pro variant
- `[twin-name]-max/SKILL.md` — qwen3.7-max superpowered variant
- `[twin-name]-basic/SKILL.md` — mimo-v2.5-pro lightweight variant

All models accessed through standard opencode-go integrations.

## License

GPL-3.0 — Free to use, modify, and distribute.
Built by Natalie Spiva [ by paperwork only ] for the AcreetionOS Project.
