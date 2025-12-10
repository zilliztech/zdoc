const { block } = require('sharp');
const z = require('zod');

const TextRun = z.object({
    content: z.string(),
    text_element_style: z.object({
        bold: z.boolean(),
        inline_code: z.boolean(),
        italic: z.boolean(),
        strikethrough: z.boolean(),
        underline: z.boolean()
    })
});

const Element = z.object({
    text_run: TextRun
});

const Style = z.object({
    align: z.number().optional(),
    language: z.string().optional(),
    wrap: z.boolean().optional(),
    folded: z.boolean().optional(),
    sequence: z.number().optional()
});

const Textual = z.object({
    elements: z.array(Element),
    style: Style
}),

const Page = z.object({
    block_id: z.string(),
    block_type: z.literal(1),
    children: z.array(z.string()),
    page: Textual,
    parent_id: z.string()
});

const Text = z.object({
    block_id: z.string(),
    block_type: z.literal(2),
    parent_id: z.string(),
    text: Textual
});

const Heading2 = z.object({
    block_id: z.string(),
    block_type: z.literal(4),
    parent_id: z.string(),
    heading2: Textual
});

const Heading3 = z.object({
    block_id: z.string(),
    block_type: z.literal(5),
    parent_id: z.string(),
    heading3: Textual
});

const Heading4 = z.object({
    block_id: z.string(),
    block_type: z.literal(6),
    parent_id: z.string(),
    heading4: Textual
});

const Heading5 = z.object({
    block_id: z.string(),
    block_type: z.literal(7),
    parent_id: z.string(),
    heading5: Textual
});

const Heading6 = z.object({
    block_id: z.string(),
    block_type: z.literal(8),
    parent_id: z.string(),
    heading6: Textual
});

const Figma = z.object({
    block_id: z.string(),
    block_type: z.literal(26),
    parent_id: z.string(),
    iframe: z.object({
        component: z.object({
            iframe_type: z.literal(8),
            url: z.string()
        })
    })
});

const Bullet = z.object({
    block_id: z.string(),
    block_type: z.literal(12),
    parent_id: z.string(),
    bullet: Textual
});

const ordered = z.object({
    block_id: z.string(),
    block_type: z.literal(13),
    parent_id: z.string(),
    ordered: Textual
});

const code = z.object({
    block_id: z.string(),
    block_type: z.literal(14),
    parent_id: z.string(),
    code: Textual
});

