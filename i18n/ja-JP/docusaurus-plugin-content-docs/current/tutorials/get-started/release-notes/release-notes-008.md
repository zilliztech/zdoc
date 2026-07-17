---
title: "リリースノート（2022年11月18日） | Cloud"
slug: /release-notes-008
sidebar_label: "2022年11月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の大規模アップデートが一般提供開始となり、招待なしで一般公開されたことをお知らせします。このリリースでは、容量最適化された Compute Units（CU）が導入され、データベースごとに最大 32 CU まで利用できるようになり、パフォーマンスが向上します。また、ローカルファイルおよび AWS S3 バケットからのデータインポートに対応し、自動インデックス作成によってプロセスを簡素化し、QPS とクエリレイテンシーのリソース監視も追加されました。さらに、データベース作成速度が 5 倍に向上し、ユーザーインターフェースもより優れた体験のために最適化されています。 | Cloud"
type: origin
token: Q9ZcwPZieiYoU4kwEuOcFjewneP
sidebar_position: 38
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2022年11月18日）

Zilliz Cloud の大規模アップデートが一般提供開始となり、招待なしで一般公開されたことをお知らせします。このリリースでは、容量最適化された Compute Units（CU）が導入され、データベースごとに最大 32 CU まで利用できるようになり、パフォーマンスが向上します。また、ローカルファイルおよび AWS S3 バケットからのデータインポートに対応し、自動インデックス作成によってプロセスを簡素化し、QPS とクエリレイテンシーのリソース監視も追加されました。さらに、データベース作成速度が 5 倍に向上し、ユーザーインターフェースもより優れた体験のために最適化されています。

- 一般公開され、Zilliz Cloud への登録に招待は不要になりました。

- 容量最適化された CUs をサポートします。

- データベースに最大 32 CUs を割り当てることをサポートします。

- ローカルファイルおよび AWS S3 バケットからのデータインポートをサポートします。

- [auto-indexing](./autoindex-explained) をサポートし、インデックスの種類を選択する必要はなくなりました。

- QPS とクエリレイテンシー向けの[リソースモニター](./metrics-alerts-reference)の設定をサポートします。

- データベース作成パフォーマンスを 5 倍に改善しました。

- より良いユーザー体験のために UI パフォーマンスを最適化しました。

