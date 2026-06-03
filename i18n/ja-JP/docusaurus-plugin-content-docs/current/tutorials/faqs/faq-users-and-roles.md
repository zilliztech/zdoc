---
title: "FAQ: ユーザーとロール | CLOUD"
slug: /faq-users-and-roles
sidebar_label: "FAQ: ユーザーとロール"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でユーザー、ロール、アクセスに関して発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 8

---

# FAQ: ユーザーとロール

このトピックでは、Zilliz Cloud でユーザー、ロール、アクセスに関して発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [組織から退出できますか？](#can-i-leave-my-organization)
- [組織名を編集するにはどうすればよいですか？](#how-can-i-edit-my-organization-name)
- [同僚やチームメイトを招待して共同作業するにはどうすればよいですか？](#how-can-i-invite-a-colleague-or-teammate-to-collaborate)
- [特定の権限を持つロールやカスタム権限グループを作成できますか？](#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups)

## よくある質問




### 組織から退出できますか？\{#can-i-leave-my-organization}

組織メンバーであれば、自由に組織から退出できます。

組織オーナーの場合、組織内の最後のオーナーでない場合にのみ組織から退出できます。組織には少なくとも 1 人のオーナーが必要であり、組織内の唯一のオーナーは退出できません。

### 組織名を編集するにはどうすればよいですか？\{#how-can-i-edit-my-organization-name}

1. 組織を選択します。

1. 左側のナビゲーションで **Settings** をクリックします。

1. **Organization** **Settings** ページの **Organization Information** セクションで、**Edit** をクリックします。

1. 新しい組織名を入力し、**Confirm** をクリックします。

1. 組織名が正常に変更されたことを示すメッセージが表示されます。

### 同僚やチームメイトを招待して共同作業するにはどうすればよいですか？\{#how-can-i-invite-a-colleague-or-teammate-to-collaborate}

組織オーナーであれば、ユーザーを組織に招待できます。詳細な手順については、[組織ユーザーの管理](./organization-users)を参照してください。

組織メンバーの場合は、他のユーザーを招待するよう組織オーナーに依頼できます。

また、Zilliz Cloud ではユーザーをプロジェクトに招待することもできます。プロジェクト管理者であれば、他のプロジェクトユーザーをプロジェクトに招待できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### 特定の権限を持つロールやカスタム権限グループを作成できますか？\{#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups}

はい。まず[サポートチケットを作成](http://support.zilliz.com)して、この機能を有効にする必要があります。機能が有効になると、SDK を使用してこのタスクを完了できます。詳細については、[権限と権限グループ](./cluster-privileges#custom-privilege-groups)を参照してください。
