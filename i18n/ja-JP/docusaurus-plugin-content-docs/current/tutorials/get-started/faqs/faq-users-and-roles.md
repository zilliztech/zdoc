---
title: "FAQ: ユーザーとロール | CLOUD"
slug: /faq-users-and-roles
sidebar_label: "FAQ: ユーザーとロール"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で発生する可能性のあるユーザー、ロール、アクセスに関する問題とその解決策について説明します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 8
displayed_sidebar: default

---

# FAQ: ユーザーとロール

このトピックでは、Zilliz Cloud で発生する可能性のあるユーザー、ロール、アクセスに関する問題とその解決策について説明します。

## 目次

- [組織を退会できますか？](#can-i-leave-my-organization)
- [組織名を変更するにはどうすればよいですか？](#how-can-i-edit-my-organization-name)
- [同僚やチームメンバーを共同作業者として招待するにはどうすればよいですか？](#how-can-i-invite-a-colleague-or-teammate-to-collaborate)
- [特定の権限やカスタム権限グループを持つロールを作成できますか？](#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups)

## よくある質問




### 組織を退会できますか？\{#can-i-leave-my-organization}

組織のメンバーであれば、いつでも自由に組織を退会できます。

組織のオーナーは、自身が最後のオーナーでない場合に限り退会できます。組織には少なくとも1人のオーナーが必要であり、唯一のオーナーである場合は退会できません。

### 組織名を変更するにはどうすればよいですか？\{#how-can-i-edit-my-organization-name}

1. 対象の組織を選択します。

1. 左側のナビゲーションで **Settings** をクリックします。

1. **Organization** **Settings** ページの **Organization Information** セクションで、**Edit** をクリックします。

1. 新しい組織名を入力し、**Confirm** をクリックします。

1. 組織名が正常に変更されたことを示すメッセージが表示されます。

### 同僚やチームメンバーを共同作業者として招待するにはどうすればよいですか？\{#how-can-i-invite-a-colleague-or-teammate-to-collaborate}

組織のオーナーであれば、組織にユーザーを招待できます。詳細な手順については、[Manage Platform Users](./manage-platform-users) を参照してください。

組織のメンバーの場合は、組織のオーナーに連絡して他のユーザーを招待してもらってください。

また、Zilliz Cloud ではプロジェクトへのユーザー招待もサポートしています。プロジェクト管理者であれば、他のユーザーをプロジェクトに招待できます。詳細な手順については、[Manage Platform Users](./manage-platform-users#project-users) を参照してください。

### 特定の権限やカスタム権限グループを持つロールを作成できますか？\{#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups}

はい、作成可能です。まず [create a support ticket](http://support.zilliz.com) からサポートチケットを作成し、機能の有効化を依頼してください。機能が有効化された後、SDK を使用してロールの作成を行えます。詳細については、[Privileges & Privilege Groups](./cluster-privileges#custom-privilege-groups) を参照してください。
