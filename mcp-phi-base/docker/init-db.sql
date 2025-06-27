-- φ-Discovery Database Schema
-- Stores validated equations and their topological relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Validated equations table
CREATE TABLE IF NOT EXISTS validated_equations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equation TEXT NOT NULL UNIQUE,
    confidence DECIMAL(10, 9) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    validation_type VARCHAR(50) NOT NULL,
    betti_vector INTEGER[] NOT NULL DEFAULT '{1,0,0}',
    chi INTEGER GENERATED ALWAYS AS (
        (betti_vector[1] - betti_vector[2] + betti_vector[3])
    ) STORED,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dependencies between equations
CREATE TABLE IF NOT EXISTS equation_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_equation_id UUID NOT NULL REFERENCES validated_equations(id),
    target_equation_id UUID NOT NULL REFERENCES validated_equations(id),
    dependency_type VARCHAR(50) NOT NULL,
    strength DECIMAL(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_equation_id, target_equation_id)
);

-- Discovery history
CREATE TABLE IF NOT EXISTS discovery_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equation TEXT NOT NULL,
    worker_type VARCHAR(50) NOT NULL,
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('past', 'present', 'future')),
    phase_lock DECIMAL(3, 2),
    patterns TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Literature references
CREATE TABLE IF NOT EXISTS literature_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equation_id UUID REFERENCES validated_equations(id),
    source VARCHAR(255) NOT NULL,
    quote TEXT,
    url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_equations_confidence ON validated_equations(confidence DESC);
CREATE INDEX idx_equations_chi ON validated_equations(chi);
CREATE INDEX idx_equations_created ON validated_equations(created_at DESC);
CREATE INDEX idx_dependencies_source ON equation_dependencies(source_equation_id);
CREATE INDEX idx_dependencies_target ON equation_dependencies(target_equation_id);
CREATE INDEX idx_history_timestamp ON discovery_history(timestamp DESC);

-- Initial seed data
INSERT INTO validated_equations (equation, confidence, validation_type, betti_vector, metadata) VALUES
    ('φ² = φ + 1', 1.0, 'theorem', '{1,0,0}', '{"fundamental": true}'),
    ('E = mc²', 0.999, 'theorem', '{1,0,0}', '{"domain": "physics"}'),
    ('∇²ψ + k²ψ = 0', 0.95, 'theorem', '{2,1,0}', '{"domain": "quantum"}'),
    ('χ = B₀ - B₁ + B₂', 1.0, 'theorem', '{3,2,1}', '{"domain": "topology"}')
ON CONFLICT (equation) DO NOTHING;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_validated_equations_updated_at BEFORE UPDATE
    ON validated_equations FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();