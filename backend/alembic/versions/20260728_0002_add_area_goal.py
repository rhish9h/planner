"""Add required goals to areas."""

from alembic import op
import sqlalchemy as sa


revision = "20260728_0002"
down_revision = "20260720_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("areas") as batch_op:
        batch_op.add_column(sa.Column("goal", sa.String(length=500), nullable=True))

    op.execute(
        sa.text("""
            UPDATE areas
            SET goal = CASE name
                WHEN 'Leetcode' THEN 'Solve a Leetcode problem'
                WHEN 'System Design' THEN 'Solve a system design problem in an interactive ChatGPT session'
                WHEN 'Low Level Design' THEN 'Solve a low-level design problem'
                WHEN 'Cyclo Veda' THEN 'Build a feature for Cyclo Veda'
                WHEN 'Fitness' THEN 'Exercise for 30 minutes'
                WHEN 'Job Applications' THEN 'Submit a job application'
                ELSE 'Complete a meaningful activity for this area'
            END
            WHERE goal IS NULL
        """)
    )

    with op.batch_alter_table("areas") as batch_op:
        batch_op.alter_column("goal", existing_type=sa.String(length=500), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("areas") as batch_op:
        batch_op.drop_column("goal")
