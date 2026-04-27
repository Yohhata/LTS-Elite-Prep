// ============================================================
// Supabase クライアント設定 (lib/supabase.ts)
//
// 【セットアップ手順】
//  1. https://supabase.com でプロジェクトを作成
//  2. .env.local.example をコピーして .env.local を作成
//  3. .env.local に Supabase の URL と anon key を貼り付ける
//     （Supabase Dashboard → Project Settings → API で確認できます）
//  4. supabase/schema.sql を Supabase の SQL Editor で実行
// ============================================================

import { createClient } from "@supabase/supabase-js";

// 環境変数から URL と キーを読み込む
// → .env.local に値を入れれば自動で読み込まれます
// → まだ設定していなくてもビルドは通ります（ダミー値で初期化）
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

// Supabase クライアント（ブラウザから使えるもの）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義（TypeScript の型チェック用。触らなくてOKです）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 予約ステータスの種類
export type BookingStatus = "pending" | "confirmed" | "cancelled";
//                           ↑ 未確認     ↑ 確定済み    ↑ キャンセル

// 予約データの型（Supabaseのテーブル構造と一致させています）
export interface Booking {
  id:             string;            // 自動生成される ID（触らなくてOK）
  created_at:     string;            // 予約が送られた日時（自動）
  name:           string;            // お客さんの名前
  email:          string;            // メールアドレス
  phone:          string | null;     // 電話番号（任意）
  program:        "futures" | "high" | "college" | "private" | "trial"; // プログラム
  preferred_date: string | null;     // 希望日（例: "2026-05-10"）
  preferred_time: string | null;     // 希望時間帯（例: "Morning (9am–12pm)"）
  message:        string | null;     // 自由記述メッセージ（任意）
  status:         BookingStatus;     // ステータス（管理者が更新）
}

// フォームから送信するデータの型（id・created_at・status は自動生成されるので不要）
export type BookingInsert = Omit<Booking, "id" | "created_at" | "status">;

export interface ClassSchedule {
  id: string;
  title: string;
  description: string | null;
  class_date: string;
  start_time: string;
  end_time: string;
  coach: string | null;
  capacity: number;
  booked_count: number;
  created_at: string;
}
