---
title: "Organization Users | BYOC"
slug: /organization-users
sidebar_label: "Organization Users"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can invite users to join organizations and provide them with access to organizations by assigning them specific roles, each with different permission levels. | BYOC"
type: origin
token: DDvMwPjZkiPgzMkNa3fc6lrfnGb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - users

---

import Admonition from '@theme/Admonition';


# Organization Users

In Zilliz Cloud, you can invite users to join organizations and provide them with access to organizations by assigning them specific [roles](./user-roles), each with different permission levels.

This guide explains how to manage organization users, including how to invite users to an organization, revoke or resend invitations, modify a member's role, or remove a member entirely.

## Invite a user to join your organization{#invite-a-user-to-join-your-organization}

To invite a user to join your organization, you can either be an [Organization Owner](./user-roles#organization-roles) or an [Organization Member](./user-roles#organization-roles).

As an Organization Owner, you can assign invitees as either Organization Owners or Members. However, as an Organization Member, invitees can only be designated as Organization Members.

Enter the email addresses of the users you wish to invite. They will receive an invitation via email, which must be accepted within 48 hours to join the organization. You can [revoke or resend this invitation](./organization-users#revoke-or-resend-an-invitation) anytime before it's accepted.

<Admonition type="info" icon="📘" title="Notes">

<p>Each time you can invite one or more users with the same role to the organization. Each organization can have up to 1,000 members.</p>

</Admonition>

![invite-user-to-org-byoc](/byoc/invite-user-to-org-byoc.png)

## Revoke or resend an invitation{#revoke-or-resend-an-invitation}

After you invite a user to join your organization, Zilliz Cloud sends an invitation email to the user. You can revoke or resend the invitation before the user accepts it.

![revoke-or-resend-org-invitation-byoc](/byoc/revoke-or-resend-org-invitation-byoc.png)

## Edit a member's role or remove a member{#edit-a-members-role-or-remove-a-member}

Once a user accepts the invitation, they join your organization as a member. Subsequently, you can edit their role or remove them from the organization as required.

To edit a member's role or remove an organization member, you must be an [Organization Owner](./user-roles#organization-roles).

![edit-user-role-or-remove-org-user-byoc](/byoc/edit-user-role-or-remove-org-user-byoc.png)

## Related topics{#related-topics}

- [User Roles](./user-roles)

- [A Panorama View](./resource-hierarchy)

- [Organizations](./organizations)

