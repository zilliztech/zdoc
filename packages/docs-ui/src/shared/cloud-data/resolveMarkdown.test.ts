import {describe, expect, it} from 'vitest';
import {resolveCloudDataMarkers, parseMarker} from './resolveMarkdown.js';
import en from './snapshots/en.json';

const model = (en as unknown as {model: any}).model;

const SSI_INCLUDE = '<!--# include virtual="/api/cloud-data/fragment.md?section=regions&provider=aws&site=en" stub="clouddata-regions-aws" -->';

describe('parseMarker', () => {
  it('maps every component form to its section request', () => {
    expect(parseMarker('<CloudRegions provider="aws" />')).toEqual({section: 'regions', provider: 'aws'});
    expect(parseMarker('  <CloudFeatures matrix="compute-types" /> ')).toEqual({section: 'compute-types'});
    expect(parseMarker('<RegionIps scope="service" />')).toEqual({section: 'service-ips'});
    expect(parseMarker('<RegionIps provider="gcp" />')).toEqual({section: 'region-ips', provider: 'gcp'});
  });

  it('returns null for unrelated lines', () => {
    expect(parseMarker('| some | table |')).toBeNull();
    expect(parseMarker('<FeatureNote variant="plan" />')).toBeNull();
  });

  it('fails closed on malformed usage', () => {
    expect(() => parseMarker('<CloudRegions />')).toThrow('provider');
    expect(() => parseMarker('<CloudFeatures matrix="nope" />')).toThrow('matrix');
    expect(() => parseMarker('<RegionIps />')).toThrow('scope');
    expect(() => parseMarker('<RegionIps scope="everything" />')).toThrow('scope');
  });
});

describe('resolveCloudDataMarkers', () => {
  it('returns non-marker content byte-identically', () => {
    const content = '# Hello\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n';
    expect(resolveCloudDataMarkers(content, model, {mode: 'ssi'}).content).toBe(content);
    expect(resolveCloudDataMarkers(content, model, {mode: 'ssi'}).resolved).toEqual([]);
  });

  it('emits the SSI block before its include, with the snapshot as stub', () => {
    const page = '### AWS\\{#aws}\n\n<CloudRegions provider="aws" />\n\n### Google Cloud\\{#google-cloud}\n';
    const result = resolveCloudDataMarkers(page, model, {mode: 'ssi'});
    const lines = result.content.split('\n');
    const blockIndex = lines.indexOf('<!--# block name="clouddata-regions-aws" -->');
    const endIndex = lines.indexOf('<!--# endblock -->');
    const includeIndex = lines.indexOf(SSI_INCLUDE);
    expect(blockIndex).toBeGreaterThan(-1);
    expect(endIndex).toBe(blockIndex + lines.slice(blockIndex + 1).indexOf('<!--# endblock -->') + 1);
    expect(includeIndex).toBe(endIndex + 1);
    expect(result.resolved).toEqual([{section: 'regions', provider: 'aws'}]);
    // The stub between block and endblock is the live-page-shaped table.
    expect(result.content).toContain('<td><p>us-west-2</p></td>');
  });

  it('uniquifies block names when one page repeats a marker', () => {
    const page = '<CloudRegions provider="aws" />\n\n<CloudRegions provider="aws" />\n';
    const result = resolveCloudDataMarkers(page, model, {mode: 'ssi'});
    expect(result.content).toContain('stub="clouddata-regions-aws"');
    expect(result.content).toContain('name="clouddata-regions-aws-2"');
    expect(result.content).toContain('stub="clouddata-regions-aws-2"');
  });

  it('snapshot mode bakes the table without any SSI directive', () => {
    const page = '### IPs\\{#ips}\n\n<RegionIps scope="service" />\n';
    const result = resolveCloudDataMarkers(page, model, {mode: 'snapshot'});
    expect(result.content).not.toContain('<!--#');
    expect(result.content).toContain('| Region | Location | IP Addresses (CIDR) |');
    expect(result.content).toContain('`54.200.111.111`');
  });

  it('leaves markers inside fenced code blocks alone', () => {
    const page = '```md\n<CloudRegions provider="aws" />\n```\n';
    expect(resolveCloudDataMarkers(page, model, {mode: 'snapshot'}).content).toBe(page);
  });

  it('fails closed when the model cannot satisfy a marker', () => {
    expect(() => resolveCloudDataMarkers('<CloudRegions provider="nope" />\n', model, {mode: 'ssi'})).toThrow('Unknown provider');
  });
});
