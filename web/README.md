## ENS Subname Registrar Website

Once you've got the [Cloudflare Worker](/worker/README.md) running, update [this line](src/pages/api/register.ts#L33-L34) to write names to Cloudflare KV.

Then, run `yarn dev` to start the website locally and test it out.
