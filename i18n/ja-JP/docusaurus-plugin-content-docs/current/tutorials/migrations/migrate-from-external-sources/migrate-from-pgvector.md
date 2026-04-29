---
title: "PostgreSQL から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_key: migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
notebook: FALSE
description: "このトピックでは、PostgreSQL から移行する際のデータ型マッピング、コレクション命名規則、および考慮事項について説明します。| Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - postgresql

---

import Admonition from '@theme/Admonition';


# PostgreSQL から Zilliz Cloud への移行

このトピックでは、[PostgreSQL](https://www.postgresql.org/) から移行する際のデータ型マッピング、コレクション命名規則、および考慮事項について Zilliz Cloud がどのように処理するかを説明します。

## 前提条件\{#prerequisites}

PostgreSQL から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### PostgreSQL の要件\{#postgresql-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>ネットワーク access</p></td>
     <td><p>Source PostgreSQL database must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>データベース access</p></td>
     <td><p>Valid database endpoint, username, and password with necessary permissions</p></td>
   </tr>
   <tr>
     <td><p>pgvector extension</p></td>
     <td><p>Tables must use pgvector extension for vector data storage</p></td>
   </tr>
   <tr>
     <td><p>Vector field requirement</p></td>
     <td><p>Each source table must contain at least one vector field, and ベクトルフィールド cannot contain null values.</p></td>
   </tr>
   <tr>
     <td><p>データ availability</p></td>
     <td><p>Source tables must contain data. Empty tables cannot be migrated.</p></td>
   </tr>
</table>

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User role</p></td>
     <td><p>組織オーナー or プロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>Cluster capacity</p></td>
     <td><p>Sufficient storage and compute resources (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate CU size)</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク access</p></td>
     <td><p>Add <a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a> to allowlists if using network restrictions</p></td>
   </tr>
</table>

## データ型マッピング\{#data-type-mapping}

PostgreSQL のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

<table>
   <tr>
     <th><p>PostgreSQL Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key / 自動ID</p></td>
     <td><ul><li><p><strong>Single-field primary key</strong>: Mapped directly as the target collection's primary key.</p></li><li><p><strong>Absence of primary key</strong>: 自動ID is enabled for the target collection to support tables without a primary key.</p></li><li><p><strong>Composite primary key:</strong> 自動ID is enabled; composite keys are treated as regular スカラーフィールド.</p><p>When migrating data, you can enable 自動ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## PostgreSQL 固有の処理規則\{#postgresql-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

PostgreSQL のテーブル名は、以下の考慮事項を踏まえて Zilliz Cloud に転送されます。

<table>
   <tr>
     <th><p>Scenario</p></th>
     <th><p>Impact</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p><strong>Default naming</strong></p></td>
     <td><p>Collection names match source table names exactly</p></td>
     <td><p>Names are preserved as-is from PostgreSQL</p></td>
   </tr>
   <tr>
     <td><p><strong>名前の競合</strong></p></td>
     <td><p>Cannot submit job if a collection with the same name already exists</p></td>
     <td><p>Delete existing collection, choose a different database, or rename during migration configuration</p></td>
   </tr>
   <tr>
     <td><p><strong>Collection name modification</strong></p></td>
     <td><p>Supported during migration</p></td>
     <td><p>You can rename collections during the migration configuration process</p></td>
   </tr>
</table>

### 移行時の考慮事項\{#migration-considerations}

以下の機能は、PostgreSQL からの移行において**サポートされていません**。

<table>
   <tr>
     <th><p>制限ation</p></th>
     <th><p>Impact</p></th>
     <th><p>Alternative</p></th>
   </tr>
   <tr>
     <td><p>Dynamic to fixed field conversion</p></td>
     <td><p>Cannot convert existing dynamic fields to fixed types</p></td>
     <td><p>Fields maintain their original dynamic nature</p></td>
   </tr>
   <tr>
     <td><p>Add more fields</p></td>
     <td><p>Cannot add new fields during migration</p></td>
     <td><p>Only existing Elasticsearch fields are migrated</p></td>
   </tr>
</table>

