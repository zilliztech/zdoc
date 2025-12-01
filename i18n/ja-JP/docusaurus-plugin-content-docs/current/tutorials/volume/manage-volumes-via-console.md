---
title: "ボリュームの管理（コンソール） | Cloud"
slug: /manage-volumes-via-console
sidebar_label: "ボリュームの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Web コンソールを使用してボリュームを管理する方法について説明します。 | Cloud"
type: origin
token: JwYYw2v0yi2eHBkFZuJcM7pXnnc
sidebar_position: 3
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - ボリューム
  - hnsw アルゴリズム
  - ベクター類似検索
  - 近似最近傍検索
  - DiskANN

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ボリュームの管理（コンソール）

このページでは、Web コンソールを使用してボリュームを管理する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

<p>ボリュームは AWS および Google Cloud でのみ作成できます。Azure でボリュームを使用する必要がある場合は、<a href="http://support.zilliz.com">サポートにお問い合わせください</a>。</p>

</Admonition>

## ボリュームの作成\{#create-a-volume}

ボリューム機能を試すだけであれば、**無料トライアルバリューム**を作成します。無料トライアルバリュームは**1つの組織につき1回のみ**作成でき、容量とファイルアップロードに制限があります。詳細については、[ボリュームの説明](./volume-explained#billing)を参照してください。

本番ワークロードには、**従量課金のボリューム**を作成します。

以下の表は、ボリュームを作成する際に使用される各パラメータを説明しています。

<table>
   <tr>
     <th><p><strong>パラメータ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>ボリューム名は、組織全体で一意である必要があり、64文字以内で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。</p></td>
   </tr>
   <tr>
     <td><p>説明</p></td>
     <td><p>このパラメータは任意です。</p></td>
   </tr>
   <tr>
     <td><p>クラウドプロバイダーとリージョン</p></td>
     <td><p>ボリュームのクラウドプロバイダーとリージョンは、データをインポートまたは移行する予定のターゲットクラスターのクラウドプロバイダーとリージョンと一致させる必要があります。</p></td>
   </tr>
</table>

<Supademo id="cmi76tseu4ok8b7b4l5nods0s?utm_source=link" title=""  />

## ボリュームを表示\{#view-volumes}

プロジェクト内のボリュームのリストを表示し、ボリューム名をクリックすることで特定のボリュームの詳細を確認できます。

![Ar8zbXfHQoQCaQxnKU4c34ednSh](/img/ar8zbxfhqoqcaqxnku4c34ednsh.png "Ar8zbXfHQoQCaQxnKU4c34ednSh")

## ボリューム内のファイルまたはフォルダの管理\{#manage-files-or-folders-in-a-volume}

ボリュームに格納されているファイルやフォルダのアップロード、表示、削除ができます。

### ファイルまたはフォルダのアップロード\{#upload-a-file-or-folder}

Web コンソールからボリュームにファイルやフォルダをアップロードすることは現在**サポートされていません**。代わりに SDK を使用してください。[ボリュームの管理（SDK）](./manage-stages#upload-data-into-a-volume)を参照してください。

### ファイルとフォルダの表示\{#view-files-and-folders}

ボリューム内の既存のファイルとフォルダを閲覧できます。

![UOT3bP88no57f8xNqmYcjFwXnFh](/img/uot3bp88no57f8xnqmycjfwxnfh.png "UOT3bP88no57f8xNqmYcjFwXnFh")

### ファイルまたはフォルダの削除\{#delete-a-file-or-folder}

ファイルやフォルダが不要になった場合は、ボリュームから削除できます。削除には、ファイルやフォルダのサイズに応じて数分かかる場合があります。

<Admonition type="caution" icon="🚧" title="警告">

<p>削除されたファイルおよびフォルダは<strong>復元できません</strong>。注意して操作してください。</p>

</Admonition>

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd?utm_source=link" title=""  />

## ボリュームの削除\{#delete-a-volume}

ボリュームが不要になった場合、いつでも削除できます。無料トライアルバリュームは1つの組織につき1回しか作成できないことに注意してください。一度削除されると、無料トライアルバリュームは作成できなくなります。

ボリュームを削除すると、同様に**すべてのファイルとフォルダ**も削除されます。

<Admonition type="caution" icon="🚧" title="警告">

<p>削除されたボリュームは<strong>復元できません</strong>。注意して操作してください。</p>

</Admonition>

<Supademo id="cmi77c5554p1gb7b4sqqsm7nn?utm_source=link" title=""  />