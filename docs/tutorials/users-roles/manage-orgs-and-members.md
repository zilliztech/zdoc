---
slug: /docs/manage-orgs-and-members
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Manage Organizations and Members

In the [organization and project](./a-panorama-view) hierarchy, you can manage your organization and members through the following actions:

- [Viewing system settings](./manage-orgs-and-members#view-system-settings)

- [Editing organization name](./manage-orgs-and-members#edit-organization-name)

- [Inviting a user to join your organization](./manage-orgs-and-members#invite-a-user-to-join-your-organization)

- [Revoking or resending an invitation](./manage-orgs-and-members#revoke-or-resend-an-invitation)

- [Editing a member's role or removing a member](./manage-orgs-and-members#edit-a-members-role-or-remove-a-member)

- [Leaving an organization](./manage-orgs-and-members#leave-an-organization)

## View system settings{#view-system-settings}

After joining an organization, you become an organization member and have permission to view system settings.

For additional details on organization settings, see [Organization Settings](https://docs.zilliz.com/docs/organization-settings).

![view-organization](/img/view-organization.png)

## Edit organization name{#edit-organization-name}

To edit the organization name, you must be an [Organization Owner](./a-panorama-view#organization-roles).

![edit-organization-name](/img/edit-organization-name.png)

## Invite a user to join your organization{#invite-a-user-to-join-your-organization}

To invite a user to join your organization, you can either be an [Organization Owner](./a-panorama-view#organization-roles) or an [Organization Member](./a-panorama-view#organization-roles).

As an Organization Owner, you can assign invitees as either Organization Owners or Members. However, as an Organization Member, invitees can only be designated as Organization Members.

Enter the email addresses of the users you wish to invite. They will receive an invitation via email, which must be accepted within 48 hours to join the organization. You can [revoke or resend this invitation](./manage-orgs-and-members#revoke-or-resend-an-invitation) anytime before it's accepted.

<Admonition type="info" icon="📘" title="Notes">

Each time you can invite one or more users with the same role to the organization. Each organization can have up to 1,000 members.

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png)

## Revoke or resend an invitation{#revoke-or-resend-an-invitation}

After you invite a user to join your organization, Zilliz Cloud sends an invitation email to the user. You can revoke or resend the invitation before the user accepts it.

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png)

## Edit a member's role or remove a member{#edit-a-members-role-or-remove-a-member}

Once a user accepts the invitation, they join your organization as a member. Subsequently, you can edit their role or remove them from the organization as required.

To edit a member's role or remove an organization member, you must be an [Organization Owner](./a-panorama-view#organization-roles).

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## Leave an organization{#leave-an-organization}

When you no longer belong to an organization, you have the option to leave it.

Note that if you are the only owner of an organization, you cannot leave it as each organization must have at least one organization owner at all times.

<Admonition type="caution" icon="🚧" title="Warning">

Once you leave an organization, your access to the organization and associated resources will be revoked.

</Admonition>

![leave-organization](/img/leave-organization.png)

## Related topics{#related-topics}

- [A Panorama View](./a-panorama-view)

- [Delete Your Organization](./delete-your-org)

- [Add Project Collaborators](./manage-projects-and-collaborator) 

