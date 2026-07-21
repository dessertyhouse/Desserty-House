import {NextRequest,NextResponse} from 'next/server';
import {v2 as cloudinary} from 'cloudinary';
export const runtime='nodejs';
const cache=new Map<string,{url:string;until:number}>();
const allowed=[
 [/^\/collections\/([a-z-]+)\/([a-z-]+-\d+)\.jpg$/,'selection'],
 [/^\/showcase\/real\/(dh-showcase-\d+)\.png$/,'previous-orders'],
 [/^\/(hero-brownie-cake|fondant-showcase)\.png$/,'site'],
] as const;
function config(){cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});}
export async function GET(req:NextRequest){const path=req.nextUrl.searchParams.get('path')||'';let folder='',name='';for(const [pattern,kind] of allowed){const m=path.match(pattern);if(m){folder=`Desserty House/${kind}${kind==='selection'?'/'+m[1]:''}`;name=kind==='selection'?m[2]:m[1];break}}if(!name)return new NextResponse('Unknown media asset',{status:404});const key=`${folder}/${name}`,hit=cache.get(key);if(hit&&hit.until>Date.now())return NextResponse.redirect(hit.url,307);try{config();// Cloudinary can display a parent folder without including it in the asset_folder value.
// Try both layouts, so either upload method works.
const candidates=[folder,folder.replace(/^Desserty House\//,'')];let asset:any;
for(const candidate of candidates){const result=await cloudinary.search.expression(`asset_folder="${candidate}" AND original_filename="${name}"`).with_field('context').max_results(1).execute();asset=result.resources?.[0];if(asset)break}
if(!asset)return new NextResponse('Cloudinary image not found. Verify the asset folder and original filename.',{status:404});const url=asset.secure_url.replace('/upload/','/upload/f_auto,q_auto,w_auto,dpr_auto/');cache.set(key,{url,until:Date.now()+1000*60*60*12});return NextResponse.redirect(url,307)}catch{return new NextResponse('Cloudinary media service is not configured.',{status:503})}}
