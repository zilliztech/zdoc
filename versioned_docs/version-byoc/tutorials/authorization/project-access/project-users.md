---
title: "Project Users | BYOC"
slug: /project-users
sidebar_label: "Project Users"
beta: FALSE
notebook: FALSE
description: "This topic describes how to manage project users. | BYOC"
type: origin
token: DXbRwHM79iK5VDkV5E8cW6N7nxb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - project users

---

import Admonition from '@theme/Admonition';


# Project Users

This topic describes how to manage project users.

## Invite a user to join a project{#invite-a-user-to-join-a-project}

To invite a user to join a project, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

Enter the email addresses of the users you wish to invite. They will receive an invitation via email, which must be accepted within 48 hours to join the project. You can [revoke or resend this invitation](./project-access) anytime before it's accepted.

<Admonition type="info" icon="📘" title="Notes">

<p>Each time you can invite one or more users with the same role to join the project.</p>

</Admonition>

![byoc-invite-user-to-project](/byoc/byoc-invite-user-to-project.png)

## Revoke or resend an invitation{#revoke-or-resend-an-invitation}

When you invite an existing organization member to a project within the same organization, they automatically gain access to the project without receiving a separate invitation. However, if you invite someone to a project within an organization they are not already a part of, they will receive an invitation to join the organization, which also grants them access to the specified project.

To revoke or resend the invitation, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

<Admonition type="info" icon="📘" title="Notes">

<p>You can revoke or resend an invitation before the user accepts it.</p>

</Admonition>

![byoc-revoke-or-cancel-invitation-to-project](/byoc/byoc-revoke-or-cancel-invitation-to-project.png)

## Edit a collaborator's role or remove a collaborator{#edit-a-collaborators-role-or-remove-a-collaborator}

After a user accepts the invitation, the user becomes a project collaborator.

To edit a collaborator's role or remove a project collaborator, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

![byoc-edit-user-role-or-remove-project-user](/byoc/byoc-edit-user-role-or-remove-project-user.png)

## Leave a project{#leave-a-project}

In addition to removing a collaborator from a project, you can also remove yourself by leaving it.

Note that if you are the only admin of a project, you cannot leave it as each project must have at least one Project Admin at all times.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave a project, your access to the project and associated resources will be revoked.</p>

</Admonition>

![byoc-leave-project](/byoc/byoc-leave-project.png)

## Related topics{#related-topics}

- [Resource Hierarchy](./resource-hierarchy)

- [Organizations](./organizations)

