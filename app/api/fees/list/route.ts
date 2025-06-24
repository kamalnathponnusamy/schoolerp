import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface PaymentHistory {
  date: string
  amount: number
  method: string
  receipt: string
  transaction_id?: string
}

interface Fee {
  id: number
  student_name: string
  student_id: string
  class_name: string
  section: string
  total_amount: number
  paid_amount: number
  tuition_fee: number
  transport_fee: number
  lab_fee: number
  library_fee: number
  sports_fee: number
  other_fees: number
  status: string
  due_date: string
  term: string
  academic_year: string
  payment_history: string | null
}

export async function GET() {
  try {
    const fees = await sql<Fee>(
      `SELECT 
        f.id,
        u.full_name as student_name,
        s.student_id,
        c.class_name,
        c.section,
        f.total_amount,
        f.paid_amount,
        f.tuition_fee,
        f.transport_fee,
        f.lab_fee,
        f.library_fee,
        f.sports_fee,
        f.other_fees,
        f.status,
        f.due_date,
        f.term,
        f.academic_year,
        (
          SELECT GROUP_CONCAT(
            CONCAT(
              fp.payment_date, '|',
              fp.amount_paid, '|',
              fp.payment_method, '|',
              fp.receipt_number, '|',
              COALESCE(fp.transaction_id, '')
            )
            ORDER BY fp.payment_date DESC
            SEPARATOR '||'
          )
          FROM fee_payments fp
          WHERE fp.fee_id = f.id
        ) as payment_history
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY f.due_date DESC`
    )

    // Process the payment history string into an array of objects
    const processedFees = fees.map(fee => ({
      ...fee,
      payment_history: fee.payment_history ? fee.payment_history.split('||').map((payment: string) => {
        const [date, amount, method, receipt, transaction_id] = payment.split('|')
        return {
          date,
          amount: parseFloat(amount),
          method,
          receipt,
          transaction_id: transaction_id || undefined
        } as PaymentHistory
      }) : []
    }))

    return NextResponse.json(processedFees)
  } catch (error) {
    console.error("Error fetching fees list:", error)
    return NextResponse.json({ error: "Failed to fetch fees list" }, { status: 500 })
  }
} 