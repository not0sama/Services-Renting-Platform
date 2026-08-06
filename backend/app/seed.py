"""
Comprehensive Seed Script for Multi-Service Hiring & Renting Platform.
Populates PostgreSQL with realistic categories, users, providers, services, bookings, reviews, and jobs.
Run: PYTHONPATH=. venv/bin/python app/seed.py
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlmodel import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.category import Category, BookingMode
from app.models.provider import ProviderProfile, ProviderTier, ProviderCategory, VerificationStatus
from app.models.service import Service, Availability
from app.models.job import JobRequest, Offer, JobStatus, OfferStatus
from app.models.booking import Booking, BookingStatus, BookingType
from app.models.payment import Payment, PaymentStatus
from app.models.review import Review

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed():
    async with AsyncSession(engine, expire_on_commit=False) as db:
        logger.info("Cleaning old demo data if exists...")
        # Clear tables in reverse dependency order
        for model in [Review, Payment, Booking, Offer, JobRequest, Service, ProviderCategory, ProviderProfile, Category, User]:
            await db.execute(delete(model))
        await db.commit()

        logger.info("Seeding database with rich demo data...")
        hashed_password = hash_password("password123")

        # 1. Admin
        admin = User(
            email="admin@hirerent.com",
            password_hash=hashed_password,
            name="Platform Admin",
            role=UserRole.admin,
            phone="+966500000000",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)

        # 2. Customers
        customers_data = [
          ("Sara Al-Mansoor", "sara@hirerent.com", "+966501111111"),
          ("Ahmed Hassan", "ahmed@hirerent.com", "+966502222222"),
          ("Khaled Omar", "khaled@hirerent.com", "+966503333333"),
          ("Nora Salem", "nora@hirerent.com", "+966504444444"),
          ("Faisal Al-Otaibi", "faisal@hirerent.com", "+966505555555"),
        ]
        customers = []
        for name, email, phone in customers_data:
            c = User(
                email=email, password_hash=hashed_password, name=name,
                role=UserRole.customer, phone=phone, is_active=True, is_verified=True
            )
            db.add(c)
            customers.append(c)

        # 3. Categories
        categories_data = [
            ("Plumbing Services", "خدمات السباكة", "plumbing", BookingMode.both, 15.0, [{"min": 0, "max": 500, "rate": 20}, {"min": 501, "max": 2000, "rate": 15}]),
            ("Electrical Services", "خدمات الكهرباء", "electrical", BookingMode.both, 15.0, None),
            ("House Cleaning", "تنظيف المنازل", "house-cleaning", BookingMode.instant, 12.0, None),
            ("HVAC & AC Repair", "صيانة التكييف", "hvac-ac-repair", BookingMode.quote, 15.0, None),
            ("Appliance Repair", "إصلاح الأجهزة", "appliance-repair", BookingMode.both, 15.0, None),
            ("Handyman Services", "خدمات صيانة عامة", "handyman", BookingMode.both, 10.0, None),
            ("Carpentry & Furniture", "النجارة والأثاث", "carpentry", BookingMode.quote, 15.0, None),
            ("Painting & Decorating", "الدهان والديكور", "painting", BookingMode.quote, 15.0, None),
            ("Moving & Transport", "نقل العفش والشحن", "moving-hauling", BookingMode.quote, 18.0, None),
            ("Event Equipment Rental", "تأجير معدات الحفلات", "event-rental", BookingMode.quote, 15.0, None),
            ("Gardening & Landscaping", "تنسيق الحدائق", "gardening", BookingMode.both, 12.0, None),
            ("Pest Control", "مكافحة الحشرات", "pest-control", BookingMode.both, 15.0, None),
            ("Roofing & Insulation", "العزل والأسطح", "roofing", BookingMode.quote, 15.0, None),
            ("Auto Care & Car Wash", "غسيل وصيانة السيارات", "auto-care", BookingMode.instant, 10.0, None),
            ("IT & Smart Home", "الشبكات والمنازل الذكية", "it-smart-home", BookingMode.both, 15.0, None),
        ]

        categories = []
        for name_en, name_ar, slug, mode, comm, tiers in categories_data:
            cat = Category(
                name_en=name_en, name_ar=name_ar, slug=slug,
                booking_mode=mode, commission_rate=comm, commission_tiers=tiers,
                is_active=True, sort_order=len(categories) + 1
            )
            db.add(cat)
            categories.append(cat)

        await db.commit()
        for c in customers: await db.refresh(c)
        for cat in categories: await db.refresh(cat)

        # 4. Providers
        providers_meta = [
            ("Apex Plumbing & Leak Detection", "pro1@hirerent.com", ProviderTier.platinum, 92.5, 4.9, 120, 24.6488, 46.7108),
            ("Voltage Pro Electricals", "pro2@hirerent.com", ProviderTier.gold, 78.0, 4.7, 85, 24.7136, 46.6753),
            ("SparkleClean Home Services", "pro3@hirerent.com", ProviderTier.gold, 74.2, 4.8, 64, 24.6892, 46.7219),
            ("CoolBreeze AC & HVAC Techs", "pro4@hirerent.com", ProviderTier.silver, 62.5, 4.5, 42, 24.7743, 46.7386),
            ("Master Craftsman Carpentry", "pro5@hirerent.com", ProviderTier.silver, 58.0, 4.6, 30, 24.7000, 46.6800),
            ("Express Appliance Fixers", "pro6@hirerent.com", ProviderTier.bronze, 45.0, 4.3, 18, 24.7200, 46.6900),
            ("Royal Paint & Renovation", "pro7@hirerent.com", ProviderTier.bronze, 42.0, 4.4, 15, 24.7300, 46.7000),
            ("Swift Movers & Packers", "pro8@hirerent.com", ProviderTier.bronze, 38.0, 4.2, 10, 24.7400, 46.7100),
            ("GreenThumb Landscaping", "pro9@hirerent.com", ProviderTier.bronze, 35.0, 4.1, 8, 24.7500, 46.7200),
            ("Shield Pest Control", "pro10@hirerent.com", ProviderTier.bronze, 30.0, 4.0, 5, 24.7600, 46.7300),
        ]

        provider_profiles = []
        services = []
        for i, (name, email, tier, trust, rating, jobs_cnt, lat, lon) in enumerate(providers_meta):
            u = User(
                email=email, password_hash=hashed_password, name=name,
                role=UserRole.provider, phone=f"+9665600000{i+1}",
                is_active=True, is_verified=True
            )
            db.add(u)
            await db.commit()
            await db.refresh(u)

            p = ProviderProfile(
                user_id=u.id, business_name=name, bio=f"Professional service provider specializing in quality work.",
                tier=tier, trust_score=trust, avg_rating=rating, completed_jobs_count=jobs_cnt,
                total_jobs_accepted=jobs_cnt + 2, verification_status=VerificationStatus.approved,
                is_online=True, service_radius_km=30.0, latitude=lat, longitude=lon
            )
            db.add(p)
            await db.commit()
            await db.refresh(p)
            provider_profiles.append(p)

            # Link category
            cat_obj = categories[i % len(categories)]
            pc = ProviderCategory(provider_id=p.id, category_id=cat_obj.id)
            db.add(pc)

            # Service package
            svc = Service(
                provider_id=p.id, category_id=cat_obj.id,
                title=f"Standard {cat_obj.name_en} Package",
                description="High quality service performed by certified team.",
                price=150.0 + (i * 25), duration_minutes=60, is_active=True
            )
            db.add(svc)
            services.append(svc)

        await db.commit()
        for s in services: await db.refresh(s)

        # 5. Bookings & Reviews
        for idx in range(12):
            cust = customers[idx % len(customers)]
            prov = provider_profiles[idx % len(provider_profiles)]
            cat = categories[idx % len(categories)]
            svc = services[idx % len(services)]

            # Completed Booking
            b = Booking(
                customer_id=cust.id, provider_id=prov.id, provider_user_id=prov.user_id,
                category_id=cat.id, service_id=svc.id, title=svc.title,
                description="Completed service booking demo", scheduled_datetime=datetime.utcnow() - timedelta(days=idx+1),
                duration_minutes=60, price=svc.price, status=BookingStatus.completed,
                booking_type=BookingType.instant
            )
            db.add(b)
            await db.commit()
            await db.refresh(b)

            # Payment
            pay = Payment(
                booking_id=b.id, customer_id=cust.id, provider_id=prov.id,
                gross_amount=svc.price, commission_pct=15.0, commission_amount=svc.price*0.15,
                net_amount=svc.price*0.85, status=PaymentStatus.released, released_at=datetime.utcnow()
            )
            db.add(pay)

            # Review with Multi-Criteria
            rev = Review(
                booking_id=b.id, reviewer_id=cust.id, provider_id=prov.id,
                rating=5, quality_rating=5, punctuality_rating=5, communication_rating=4,
                comment="Excellent service! Highly recommended.", provider_response="Thank you for your feedback!"
            )
            db.add(rev)

        # 6. Open Job Requests with Urgent Negotiation
        urgent_job = JobRequest(
            customer_id=customers[0].id, category_id=categories[0].id,
            title="Emergency Water Leak in Kitchen",
            description="Water pipe burst under kitchen sink. Need immediate fix within 1 hour!",
            is_urgent=True, urgent_surcharge_pct=25.0, budget_min=200, budget_max=400,
            status=JobStatus.open
        )
        db.add(urgent_job)
        await db.commit()
        await db.refresh(urgent_job)

        # Provider offers on urgent job
        offer1 = Offer(
            job_id=urgent_job.id, provider_id=provider_profiles[0].id,
            price=250.0, duration_minutes=45, urgent_surcharge_pct=25.0,
            message="On my way! I can fix this leak immediately.", best_match_score=94.5,
            status=OfferStatus.pending
        )
        offer2 = Offer(
            job_id=urgent_job.id, provider_id=provider_profiles[1].id,
            price=220.0, duration_minutes=60, urgent_surcharge_pct=20.0, # Countered premium
            message="I can be there in 30 minutes with full repair kit.", best_match_score=88.0,
            status=OfferStatus.pending
        )
        db.add(offer1)
        db.add(offer2)

        await db.commit()
        logger.info("Database successfully seeded with categories, providers, bookings, reviews, and urgent jobs!")

async def main():
    await seed()

if __name__ == "__main__":
    asyncio.run(main())
