---
slug: /docs/byoc/manage-projects-and-collaborator
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Projects and Collaborators

In the [organization and project](./a-panorama-view) hierarchy, you can manage projects and collaborators through the following actions:

- [Creating a project](./manage-projects-and-collaborator#create-a-project)

- [Renaming a project](./manage-projects-and-collaborator#rename-a-project)

- [Deleting a project](./manage-projects-and-collaborator#delete-a-project)

- [Inviting a user to join a project](./manage-projects-and-collaborator#invite-a-user-to-join-a-project)

- [Revoking or resending an invitation](./manage-projects-and-collaborator#revoke-or-resend-an-invitation)

- [Editing a collaborator's role or removing a collaborator](./manage-projects-and-collaborator#edit-a-collaborators-role-or-remove-a-collaborator)

- [Leaving a project](./manage-projects-and-collaborator#leave-a-project)

## Create a project{#create-a-project}

To create a project, you must be an [Organization Owner](./a-panorama-view#organization-roles).

<Admonition type="info" icon="📘" title="Notes">

When you create a project, you are also a [Project Owner](./a-panorama-view#project-roles) for the project.

</Admonition>

![create-project-byoc](/byoc/create-project-byoc.png)

## Rename a project{#rename-a-project}

To rename a project, you must be an [Organization Owner](./a-panorama-view#organization-roles).

<Admonition type="info" icon="📘" title="Notes">

Each organization contains a default project. The name of the default project cannot be modified.

</Admonition>

![rename-project-byoc](/byoc/rename-project-byoc.png)

## Delete a project{#delete-a-project}

To delete a project, you must be an [Organization Owner](./a-panorama-view#organization-roles).

<Admonition type="info" icon="📘" title="Notes">

Each organization contains a default project. The default project cannot be deleted.

</Admonition>

![delete-project-byoc](/byoc/delete-project-byoc.png)

## Invite a user to join a project{#invite-a-user-to-join-a-project}

To invite a user to join a project, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

Enter the email addresses of the users you wish to invite. They will receive an invitation via email, which must be accepted within 48 hours to join the project. You can [revoke or resend this invitation](./manage-projects-and-collaborator#revoke-or-resend-an-invitation) anytime before it's accepted.

<Admonition type="info" icon="📘" title="Notes">

Each time you can invite one or more users with the same role to join the project.

</Admonition>

![invite-user-to-project](/byoc/invite-user-to-project.png)

## Revoke or resend an invitation{#revoke-or-resend-an-invitation}

When you invite an existing organization member to a project within the same organization, they automatically gain access to the project without receiving a separate invitation. However, if you invite someone to a project within an organization they are not already a part of, they will receive an invitation to join the organization, which also grants them access to the specified project.

To revoke or resend the invitation, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

<Admonition type="info" icon="📘" title="Notes">

You can revoke or resend an invitation before the user accepts it.

</Admonition>

![revoke-or-cancel-invitation-to-project](/byoc/revoke-or-cancel-invitation-to-project.png)

## Edit a collaborator's role or remove a collaborator{#edit-a-collaborators-role-or-remove-a-collaborator}

After a user accepts the invitation, the user becomes a project collaborator.

To edit a collaborator's role or remove a project collaborator, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

![edit-user-role-or-remove-project-user](/byoc/edit-user-role-or-remove-project-user.png)

## Leave a project{#leave-a-project}

When you no longer belong to a project, you have the option to leave it.

Note that if you are the only owner of a project, you cannot leave it as each project must have at least one project owner at all times.

<Admonition type="caution" icon="🚧" title="Warning">

Once you leave a project, your access to the project and associated resources will be revoked.

</Admonition>

![leave-project](/byoc/leave-project.png)

## Related topics{#related-topics}

- [A Panorama View](./a-panorama-view)

- [Manage Organization Information](./manage-orgs-and-members) 

- [Delete Your Organization](./undefined)
