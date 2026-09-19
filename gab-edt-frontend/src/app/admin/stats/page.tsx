"use client";

import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { fetchWithAuth, extractArray } from '@/lib/api';
import { motion } from 'framer-motion';

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depts, rooms, teachers] = await Promise.all([
          fetchWithAuth('/org-units').then(res => extractArray(res)),
          fetchWithAuth('/rooms').then(res => extractArray(res)),
          fetchWithAuth('/teachers').then(res => extractArray(res))
        ]);

        // Process Bar Chart (Rooms capacity by OrgUnit)
        const orgUnitCapacities = depts.map((dept: any) => {
          const deptRooms = rooms.filter((r: any) => r.orgUnitId === dept.id);
          const totalCapacity = deptRooms.reduce((acc: number, r: any) => acc + (r.capacity || 0), 0);
          return {
            campus: dept.name, // on garde la clé "campus" pour le ResponsiveBar (indexBy="campus")
            capacite: totalCapacity
          };
        }).filter((item: any) => item.capacite > 0);
        setBarData(orgUnitCapacities);

        // Process Pie Chart (Teachers by Department)
        const deptTeachers = depts.map((dept: any) => {
          const deptT = teachers.filter((t: any) => t.orgUnitIds && t.orgUnitIds.includes(dept.id));
          return {
            id: dept.name,
            label: dept.name,
            value: deptT.length
          };
        }).filter((item: any) => item.value > 0);
        setPieData(deptTeachers);

      } catch (err) {
        console.error("Error loading stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Chargement des statistiques...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '2rem' }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tableau de Bord Analytique</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Visualisation des ressources globales (Propulsé par Nivo)</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Bar Chart */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
          style={{ 
            height: '400px', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: '16px',
            boxShadow: 'var(--box-shadow)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Capacité Totale par Département</h2>
          {barData.length > 0 ? (
            <ResponsiveBar
                data={barData}
                keys={['capacite']}
                indexBy="campus"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderRadius={4}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Département',
                    legendPosition: 'middle',
                    legendOffset: 40
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Places disponibles',
                    legendPosition: 'middle',
                    legendOffset: -50
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                animate={true}
            />
          ) : <p>Pas assez de données pour le Bar Chart</p>}
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
          style={{ 
            height: '400px', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: '16px',
            boxShadow: 'var(--box-shadow)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Répartition des Enseignants</h2>
          {pieData.length > 0 ? (
            <ResponsivePie
                data={pieData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'set3' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
                animate={true}
            />
          ) : <p>Pas assez de données pour le Pie Chart</p>}
        </motion.div>

      </div>
    </motion.div>
  );
}
