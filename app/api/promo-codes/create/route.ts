import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { DiscountType } from "@/lib/types";

interface CreatePromoCodeBody {
  campaignInfluencerId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  commissionRate: number;
  usageLimit: number | null;
  expiresAt: string | null;
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json()) as CreatePromoCodeBody;
  const code = body.code.trim().toUpperCase();

  if (!body.campaignInfluencerId || !code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("promo_codes")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: `Code "${code}" is already in use` }, { status: 409 });
  }

  const { data: promoCode, error } = await supabase
    .from("promo_codes")
    .insert({
      campaign_influencer_id: body.campaignInfluencerId,
      code,
      discount_type: body.discountType,
      discount_value: body.discountValue,
      commission_rate: body.commissionRate,
      usage_limit: body.usageLimit,
      expires_at: body.expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ promoCode });
}
