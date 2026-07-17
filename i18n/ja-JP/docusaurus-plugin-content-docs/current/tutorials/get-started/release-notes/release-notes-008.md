---
title: "リリースノート（2022年11月18日） | Cloud"
slug: /release-notes-008
sidebar_label: "2022年11月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の大規模アップデートが一般提供になり、招待なしで一般公開されたことをお知らせできることを嬉しく思います。このリリースでは、パフォーマンス向上のためにデータベースごとに最大 32 CU を利用できる、容量最適化された Compute Unit（CU）が導入されました。また、ローカルファイルおよび AWS S3 バケットからのデータインポートに対応し、auto-indexing によってプロセスが簡素化され、QPS とクエリレイテンシのリソース監視も追加されています。さらに、データベース作成速度が 5 倍に向上し、より優れた体験のためにユーザーインターフェースも最適化されました。 | Cloud"
type: origin
token: Q9ZcwPZieiYoU4kwEuOcFjewneP
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2022年11月18日）

Zilliz Cloud の大規模アップデートが一般提供になり、招待なしで一般公開されたことをお知らせできることを嬉しく思います。このリリースでは、パフォーマンス向上のためにデータベースごとに最大 32 CU を利用できる、容量最適化された Compute Units（CU）が導入されました。また、ローカルファイルおよび AWS S3 バケットからのデータインポートに対応し、auto-indexing によってプロセスが簡素化され、QPS とクエリレイテンシのリソース監視も追加されています。さらに、データベース作成速度が 5 倍に向上し、より優れた体験のためにユーザーインターフェースも最適化されました。

- 一般公開され、Zilliz Cloud への登録に招待は不要になりました。

- 容量最適化された CU をサポートします。

- データベースに最大 32 CU を割り当てることをサポートします。

- ローカルファイルおよび AWS S3 バケットからのデータインポートをサポートします。

- [auto-indexing](./autoindex-explained) をサポートし、インデックスの種類を選択する必要はなくなりました。

- QPS とクエリレイテンシ向けの[リソースモニター](./metrics-alerts-reference)の設定をサポートします。

- データベース作成パフォーマンスを 5 倍向上させます。

- より良いユーザー体験のために UI パフォーマンスを最適化します。

