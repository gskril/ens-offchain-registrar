## ENS Subname Registrar Website

Once you've deployed the [CloudFlare Worker](/worker/README.md), update [this line](src/pages/api/register.ts#L33-L34) to point to your endpoint.

Then, run `yarn dev` to start the website locally and test it out.
