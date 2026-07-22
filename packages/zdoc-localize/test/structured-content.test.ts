import {describe, expect, it} from 'vitest';

import {
  applySlotTranslations,
  extractTranslationSlots,
  structuredTopologyHash,
} from '../src/domain/structured-content.js';
import type {SemanticNodeStructure} from '../src/domain/model.js';

describe('structured translation content', () => {
  const nestedList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
    kind: 'list',
    ordered: true,
    items: [
      {content: [{kind: 'text', text: 'You have an integration'}], children: []},
      {
        content: [{kind: 'text', text: 'You selected a model'}],
        children: [{
          ordered: false,
          items: [{
            content: [{kind: 'text', text: 'Feature Extraction is supported'}],
            children: [],
          }],
        }],
      },
    ],
  };

  it('extracts stable nested-list slots and rejects any non-exact slot set', () => {
    expect(extractTranslationSlots(nestedList)).toEqual([
      {slotId: 'item-0/text', sourceText: 'You have an integration', preserved: []},
      {slotId: 'item-1/text', sourceText: 'You selected a model', preserved: []},
      {
        slotId: 'item-1/child-0/item-0/text',
        sourceText: 'Feature Extraction is supported',
        preserved: [],
      },
    ]);

    expect(() => applySlotTranslations(nestedList, [
      {slotId: 'unknown', translatedText: '错误'},
    ])).toThrowError(expect.objectContaining({subtype: 'structured_slot_mismatch'}));
  });

  it('keeps list topology immutable while replacing every exact slot', () => {
    const topologyHash = structuredTopologyHash(nestedList);
    const translated = applySlotTranslations(nestedList, [
      {slotId: 'item-0/text', translatedText: '你已有集成'},
      {slotId: 'item-1/text', translatedText: '你选择了模型'},
      {slotId: 'item-1/child-0/item-0/text', translatedText: '支持 Feature Extraction'},
    ], topologyHash);

    expect(topologyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(structuredTopologyHash(translated)).toBe(topologyHash);
    expect(extractTranslationSlots(translated).map((slot) => slot.sourceText)).toEqual([
      '你已有集成',
      '你选择了模型',
      '支持 Feature Extraction',
    ]);
    expect(structuredTopologyHash({...nestedList, ordered: false})).not.toBe(topologyHash);
    expect(() => applySlotTranslations(nestedList, extractTranslationSlots(nestedList).map((slot) => ({
      slotId: slot.slotId,
      translatedText: slot.sourceText,
    })), '0'.repeat(64))).toThrowError(expect.objectContaining({subtype: 'structured_topology_mismatch'}));
  });

  it('treats adjacent equivalent plain-text runs as one semantic span in lists and tables', () => {
    const split = [{kind: 'text' as const, text: 'Hello '}, {kind: 'text' as const, text: 'world'}];
    const list: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{content: split, children: []}],
    };
    const table: Extract<SemanticNodeStructure, {kind: 'table'}> = {
      kind: 'table',
      rows: [{cells: [{content: [{kind: 'paragraph', content: split}]}]}],
    };

    expect(extractTranslationSlots(list)[0]!.sourceText).toBe('Hello world');
    expect(structuredTopologyHash(list)).toBe(structuredTopologyHash({
      ...list,
      items: [{content: [{kind: 'text', text: 'Hello world'}], children: []}],
    }));
    const translatedList = applySlotTranslations(list, [
      {slotId: 'item-0/text', translatedText: '你好，世界'},
    ], structuredTopologyHash(list));
    expect(translatedList.items[0]!.content).toEqual([{kind: 'text', text: '你好，世界'}]);

    expect(extractTranslationSlots(table)[0]!.sourceText).toBe('Hello world');
    const translatedTable = applySlotTranslations(table, [
      {slotId: 'row-0/cell-0/paragraph-0', translatedText: '你好，世界'},
    ], structuredTopologyHash(table));
    expect(translatedTable.rows[0]!.cells[0]!.content[0]).toEqual({
      kind: 'paragraph',
      content: [{kind: 'text', text: '你好，世界'}],
    });
  });

  it('uses stable table row/cell/node indices and preserves code-only cells exactly', () => {
    const table: Extract<SemanticNodeStructure, {kind: 'table'}> = {
      kind: 'table',
      rows: [{
        cells: [
          {content: [
            {kind: 'paragraph', content: [{kind: 'text', text: 'Model name'}]},
            {kind: 'paragraph', content: [{kind: 'text', text: 'Choose a model'}]},
          ]},
          {content: [{kind: 'code', language: 'python', text: 'model_name = "all-MiniLM-L6-v2"\n'}]},
        ],
      }],
    };

    expect(extractTranslationSlots(table)).toEqual([
      {slotId: 'row-0/cell-0/paragraph-0', sourceText: 'Model name', preserved: []},
      {slotId: 'row-0/cell-0/paragraph-1', sourceText: 'Choose a model', preserved: []},
    ]);

    const translated = applySlotTranslations(table, [
      {slotId: 'row-0/cell-0/paragraph-0', translatedText: '模型名称'},
      {slotId: 'row-0/cell-0/paragraph-1', translatedText: '选择模型'},
    ], structuredTopologyHash(table));

    expect(translated.rows[0]!.cells[1]).toEqual(table.rows[0]!.cells[1]);
    expect(translated.rows[0]!.cells[1]).not.toBe(table.rows[0]!.cells[1]);
    expect(structuredTopologyHash(translated)).toBe(structuredTopologyHash(table));
  });

  it('allows a validated localized link target without changing the structural topology', () => {
    const linkedList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [
          {kind: 'text', text: 'Read '},
          {kind: 'link', text: 'the guide', url: 'https://docs.example.com/en/setup'},
        ],
        children: [],
      }],
    };
    const topologyHash = structuredTopologyHash(linkedList);

    const translated = applySlotTranslations(linkedList, [{
      slotId: 'item-0/text',
      translatedText: '阅读[指南](https://docs.example.com/zh/setup)',
    }], topologyHash);

    expect(translated.items[0]!.content).toEqual([
      {kind: 'text', text: '阅读'},
      {kind: 'link', text: '指南', url: 'https://docs.example.com/zh/setup'},
    ]);
    expect(structuredTopologyHash(translated)).toBe(topologyHash);
  });

  it('rebuilds every supported inline mark without changing protected code topology', () => {
    const richList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [
          {kind: 'text', text: 'Bold', bold: true},
          {kind: 'text', text: ' | '},
          {kind: 'text', text: 'Italic', italic: true},
          {kind: 'text', text: ' | '},
          {kind: 'text', text: 'Underline', underline: true},
          {kind: 'text', text: ' | '},
          {kind: 'text', text: 'Strike', strike: true},
          {kind: 'text', text: ' | '},
          {kind: 'link', text: 'Guide', url: 'https://docs.example.com/en'},
          {kind: 'text', text: ' | '},
          {kind: 'code', text: 'model_name'},
        ],
        children: [],
      }],
    };
    const topologyHash = structuredTopologyHash(richList);

    const translated = applySlotTranslations(richList, [{
      slotId: 'item-0/text',
      translatedText: '**粗体** | *斜体* | <u>下划线</u> | ~~删除线~~ | [指南](https://docs.example.com/zh) | `model_name`',
    }], topologyHash);

    expect(translated.items[0]!.content).toEqual([
      {kind: 'text', text: '粗体', bold: true},
      {kind: 'text', text: ' | '},
      {kind: 'text', text: '斜体', italic: true},
      {kind: 'text', text: ' | '},
      {kind: 'text', text: '下划线', underline: true},
      {kind: 'text', text: ' | '},
      {kind: 'text', text: '删除线', strike: true},
      {kind: 'text', text: ' | '},
      {kind: 'link', text: '指南', url: 'https://docs.example.com/zh'},
      {kind: 'text', text: ' | '},
      {kind: 'code', text: 'model_name'},
    ]);
    expect(structuredTopologyHash(translated)).toBe(topologyHash);

    expect(() => applySlotTranslations(richList, [{
      slotId: 'item-0/text',
      translatedText: '**粗体** | *斜体* | <u>下划线</u> | ~~删除线~~ | [指南](https://docs.example.com/zh) | `other_name`',
    }], topologyHash)).toThrowError(expect.objectContaining({subtype: 'structured_topology_mismatch'}));
  });

  it('round-trips literal Markdown markers, delimiter characters, and embedded code backticks', () => {
    const literalList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [
          {kind: 'text', text: String.raw`*required* [literal] <u>not underlined</u> \\ path `},
          {kind: 'code', text: 'model`name\\value'},
        ],
        children: [],
      }],
    };
    const slot = extractTranslationSlots(literalList)[0]!;

    expect(slot.sourceText).toBe(String.raw`\*required\* \[literal\] \<u\>not underlined\</u\> \\\\ path ` + '`' + String.raw`model\`name\\value` + '`');
    const translated = applySlotTranslations(literalList, [{
      slotId: slot.slotId,
      translatedText: slot.sourceText,
    }], structuredTopologyHash(literalList));

    expect(translated.items[0]!.content).toEqual(literalList.items[0]!.content);
  });

  it('round-trips link labels and URLs containing Markdown delimiters', () => {
    const linkedList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [{
          kind: 'link',
          text: 'Guide [advanced] ] setup',
          url: 'https://docs.example.com/a_(b)/finish)?mode=(safe)',
        }],
        children: [],
      }],
    };
    const slot = extractTranslationSlots(linkedList)[0]!;

    expect(slot.sourceText).toBe(String.raw`[Guide \[advanced\] \] setup](https://docs.example.com/a_\(b\)/finish\)?mode=\(safe\))`);
    const translated = applySlotTranslations(linkedList, [{
      slotId: slot.slotId,
      translatedText: slot.sourceText,
    }], structuredTopologyHash(linkedList));

    expect(translated.items[0]!.content).toEqual(linkedList.items[0]!.content);
  });

  it('round-trips every supported mark combination with exact whitespace', () => {
    const markedList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [{
          kind: 'text',
          text: '  *literal*  ',
          bold: true,
          italic: true,
          underline: true,
          strike: true,
        }],
        children: [],
      }],
    };
    const slot = extractTranslationSlots(markedList)[0]!;
    const translated = applySlotTranslations(markedList, [{
      slotId: slot.slotId,
      translatedText: slot.sourceText,
    }], structuredTopologyHash(markedList));

    expect(translated.items[0]!.content).toEqual(markedList.items[0]!.content);
  });

  it('preserves intentional leading and trailing whitespace in a slot', () => {
    const spacedList: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{content: [{kind: 'text', text: 'Source'}], children: []}],
    };

    const translated = applySlotTranslations(spacedList, [{
      slotId: 'item-0/text',
      translatedText: '  保留边界  ',
    }]);

    expect(translated.items[0]!.content).toEqual([{kind: 'text', text: '  保留边界  '}]);
  });

  it('aggregates multiple bold spans as one per-slot structural token count', () => {
    const list: Extract<SemanticNodeStructure, {kind: 'list'}> = {
      kind: 'list',
      ordered: false,
      items: [{
        content: [
          {kind: 'text', text: 'First', bold: true},
          {kind: 'text', text: ' and '},
          {kind: 'text', text: 'Second', bold: true},
        ],
        children: [],
      }],
    };

    expect(extractTranslationSlots(list)[0]!.preserved).toEqual([
      {kind: 'bold_span', value: '', count: 2},
    ]);
  });
});
