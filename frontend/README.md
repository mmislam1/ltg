This a web app that allows users create their own diet chart and keep track of it. It also lets one get their chart in PDF format for convenience.
Watch it live here: https://losetogainnext.netlify.app/

Link subjected to change, as the project is currently under development.

## Theme configuration

The interface uses Comfortaa and a green, white, and gray design system by
default. Copy `.env.example` to `.env.local` to override the typography or
semantic colors. Restart the development server after changing environment
values.

`NEXT_PUBLIC_THEME_FONT_FAMILY` accepts `Comfortaa` or a CSS font stack. Color
variables accept valid CSS colors; the primary hover, active, and soft shades
are derived automatically when their explicit variables are omitted.
