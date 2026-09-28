import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { getCampaignInfluencerFull } from "@/lib/data";
import { getConversionsWithPromoCode } from "@/lib/analytics-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 4, fontWeight: 700 },
  h2: { fontSize: 10, marginBottom: 16, color: "#666666" },
  sectionTitle: { fontSize: 13, marginTop: 16, marginBottom: 8, fontWeight: 700 },
  statsRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  stat: { flex: 1, borderWidth: 1, borderColor: "#dddddd", borderRadius: 4, padding: 8 },
  statLabel: { fontSize: 9, color: "#666666", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 700 },
  table: { display: "flex", width: "100%" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeeee", paddingVertical: 4 },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333333", paddingVertical: 4 },
  cell: { flex: 1, fontSize: 9 },
  headerCell: { flex: 1, fontSize: 9, fontWeight: 700 },
});

export async function GET(
  req: NextRequest,
  { params }: { params: { influencerId: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [full, conversions] = await Promise.all([
    getCampaignInfluencerFull(params.influencerId),
    getConversionsWithPromoCode(params.influencerId),
  ]);

  if (!full) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalRevenue = conversions.reduce((s, c) => s + c.order_amount, 0);
  const totalCommission = conversions.reduce((s, c) => s + c.commission_amount, 0);
  const paidCommission = conversions
    .filter((c) => c.commission_paid)
    .reduce((s, c) => s + c.commission_amount, 0);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{full.influencer.name}</Text>
        <Text style={styles.h2}>
          {full.influencer.handle} · {full.influencer.platform} · {full.campaign.name} ({full.campaign.brand})
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Conversions</Text>
            <Text style={styles.statValue}>{conversions.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Commission (paid / total)</Text>
            <Text style={styles.statValue}>
              {formatCurrency(paidCommission)} / {formatCurrency(totalCommission)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conversions</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerCell}>Order ID</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Amount</Text>
            <Text style={styles.headerCell}>Commission</Text>
            <Text style={styles.headerCell}>Promo code</Text>
            <Text style={styles.headerCell}>Paid</Text>
          </View>
          {conversions.map((c) => (
            <View key={c.id} style={styles.tableRow}>
              <Text style={styles.cell}>#{c.order_id}</Text>
              <Text style={styles.cell}>{formatDate(c.created_at)}</Text>
              <Text style={styles.cell}>{formatCurrency(c.order_amount)}</Text>
              <Text style={styles.cell}>{formatCurrency(c.commission_amount)}</Text>
              <Text style={styles.cell}>{c.promo_code?.code ?? "—"}</Text>
              <Text style={styles.cell}>{c.commission_paid ? "Yes" : "No"}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${full.influencer.handle.replace(/^@/, "")}-report.pdf"`,
    },
  });
}
