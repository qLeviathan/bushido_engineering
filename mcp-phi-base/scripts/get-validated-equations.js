#!/usr/bin/env node
/**
 * Script to retrieve the master list of validated equations
 * from the PostgreSQL database
 */

const { Pool } = require('pg');
require('dotenv').config();

async function getValidatedEquations() {
    // Create PostgreSQL connection pool
    const pool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'phi_discovery',
        user: process.env.POSTGRES_USER || 'phi_user',
        password: process.env.POSTGRES_PASSWORD || 'phi_golden_ratio'
    });

    try {
        console.log('Connecting to PostgreSQL database...\n');
        
        // Query all validated equations ordered by confidence
        const result = await pool.query(`
            SELECT 
                equation,
                confidence,
                validation_type,
                betti_vector,
                chi,
                created_at,
                updated_at,
                metadata
            FROM validated_equations
            ORDER BY confidence DESC, created_at DESC
        `);

        console.log('=== MASTER VALIDATED EQUATION LIST ===\n');
        console.log(`Total validated equations: ${result.rows.length}\n`);
        
        // Display each equation
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.equation}`);
            console.log(`   Confidence: ${(row.confidence * 100).toFixed(1)}%`);
            console.log(`   Validation Type: ${row.validation_type}`);
            console.log(`   Betti Vector: [${row.betti_vector.join(', ')}]`);
            console.log(`   Euler Characteristic (χ): ${row.chi}`);
            console.log(`   Created: ${row.created_at}`);
            if (row.updated_at && row.updated_at !== row.created_at) {
                console.log(`   Updated: ${row.updated_at}`);
            }
            console.log('');
        });

        // Summary statistics
        console.log('=== SUMMARY STATISTICS ===\n');
        
        // Group by validation type
        const byType = result.rows.reduce((acc, row) => {
            acc[row.validation_type] = (acc[row.validation_type] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Equations by validation type:');
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        
        // Average confidence
        const avgConfidence = result.rows.reduce((sum, row) => sum + parseFloat(row.confidence), 0) / result.rows.length;
        console.log(`\nAverage confidence: ${(avgConfidence * 100).toFixed(1)}%`);
        
        // Export option
        if (process.argv[2] === '--export') {
            const fs = require('fs');
            const exportData = result.rows.map(row => ({
                equation: row.equation,
                confidence: row.confidence,
                validation_type: row.validation_type,
                betti_vector: row.betti_vector,
                chi: row.chi,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
            
            const filename = `validated_equations_${new Date().toISOString().split('T')[0]}.json`;
            fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
            console.log(`\nExported to ${filename}`);
        }

    } catch (error) {
        console.error('Error retrieving equations:', error.message);
        console.error('\nMake sure the PostgreSQL database is running and accessible.');
        console.error('You may need to run: docker-compose up -d postgres');
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    console.log('φ-Discovery System - Validated Equation Retrieval\n');
    
    getValidatedEquations()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}

module.exports = { getValidatedEquations };