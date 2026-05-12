# Coal Mining Lifecycle Primer

## Why This Matters For GeoWorkbench

GeoWorkbench is currently focused on borehole interpretation. That sits mainly in the exploration and geological modelling part of the coal mining lifecycle.

The larger coal sector roadmap also talks about drilling, seismic, remote sensing, LiDAR, mine planning software, ERP, IoT, transport, safety, production, and mine closure. Those are connected, but they belong to different stages of the coal value chain.

## Simple Lifecycle

```text
Regional understanding
  -> exploration
  -> resource modelling
  -> mine planning
  -> approvals and project development
  -> production operations
  -> coal handling / transport / dispatch
  -> monitoring, compliance, and closure
```

## 1. Regional Understanding

### Purpose

Identify where coal-bearing basins and blocks may exist.

### Typical Data

- geological maps
- old reports
- satellite imagery
- remote sensing
- gravity/magnetic/geophysical regional data
- previous boreholes

### Roles

- government geological agencies
- survey organizations
- exploration planners
- remote sensing/GIS teams

### Where Technology Roadmap Fits

Satellite imagery, remote sensing, and LiDAR are useful here for landform mapping, surface change, settlement/vegetation monitoring, mine closure monitoring, and planning context.

## 2. Exploration

### Purpose

Confirm whether coal exists, where it occurs, how thick it is, what quality it has, and whether it is geologically mineable.

### Typical Activities

- reconnaissance survey
- regional/promotional exploration
- detailed exploration
- drilling boreholes
- recovering core
- photographing core boxes
- lithology logging
- geophysical logging
- 2D/3D seismic surveys
- sampling coal for quality testing

### Typical Data

- borehole collar/location
- borehole depth
- core photos
- lithology intervals
- coal seam intervals
- recovery
- RQD/geotechnical values
- geophysical curves
- coal quality lab results
- seismic interpretations
- geological reports

### Roles

- exploration geologist
- drilling contractor
- core logging geologist
- geophysicist
- survey/GIS team
- lab/coal quality team
- geological data manager
- report/resource geologist

### GeoWorkbench Fit

This is the main current product area.

The PBH-62 workbook and core images are exploration-stage data. They represent a borehole log created from drilling and core logging.

## 3. Resource Modelling

### Purpose

Convert boreholes, seams, quality data, and geology into a resource model.

### Typical Work

- correlate seams across boreholes
- build geological sections
- estimate seam continuity
- model faults, intrusions, washouts, seam splitting/merging
- estimate coal quantity
- classify resources by confidence
- estimate quality distribution

### Typical Tools

- Minex
- Paradigm
- Surpac
- Vulcan
- Datamine
- AutoCAD/GIS tools

### GeoWorkbench Fit

GeoWorkbench can prepare clean data for these tools and eventually support correlation and lightweight modelling views.

It does not need to replace Minex or Paradigm initially. It can become the workflow layer before and around them.

## 4. Mine Planning

### Purpose

Decide how the coal will be mined economically and safely.

### Typical Work

- opencast or underground method selection
- pit design or underground layout
- production scheduling
- equipment planning
- slope/strata control
- reserve estimation
- economics

### Typical Data

- geological model
- seam thickness/quality
- overburden thickness
- geotechnical data
- hydrology
- land/environment constraints
- production targets

### GeoWorkbench Fit

Indirect for MVP. GeoWorkbench can provide cleaner geological inputs and reports.

## 5. Production Operations

### Purpose

Extract coal safely and efficiently.

### Typical Work

- drilling and blasting
- excavation
- haulage
- underground development/longwall operations
- grade control
- dispatch
- safety monitoring

### Typical Data

- production tonnage
- equipment telemetry
- drilling/blasting parameters
- fleet data
- IoT sensors
- safety data
- slope/strata monitoring
- coal quality at dispatch

### GeoWorkbench Fit

Future opportunity only. If operational runtime data becomes available, the Log Widget model could support live depth/time tracks and backplotting.

## 6. Coal Handling, Transport, and Dispatch

### Purpose

Move coal from mine to plant/customer with quality and logistics control.

### Typical Data

- conveyor/CHP data
- weighbridge
- rail/road dispatch
- stockyard inventory
- quality sampling
- ERP systems

### GeoWorkbench Fit

Not part of the first product. Roadmap technologies like ERP, IoT, and transport automation sit here.

## 7. Monitoring and Closure

### Purpose

Monitor environment, land, safety, rehabilitation, and closure obligations.

### Typical Data

- satellite/remote sensing
- drone/LiDAR
- vegetation/plantation monitoring
- subsidence
- water/environmental monitoring
- closure plans

### GeoWorkbench Fit

Potential future module, but separate from borehole interpretation.

## Important Concepts

## Borehole

A drilled hole used to understand underground geology.

In coal exploration, boreholes tell us:

- what rock layers exist
- where coal occurs
- how thick seams are
- how deep seams are
- what quality coal may have
- how strong/fractured surrounding rocks are

## Core

Cylindrical rock sample recovered from drilling.

The geologist logs the core to identify lithology, coal, structures, recovery, and remarks.

## Core Box

Physical tray/box used to store recovered core in depth order.

The image folder in this repo contains photos of core boxes for PBH-62.

## Lithology

The type of rock or material logged in an interval.

Examples:

- coal
- shale
- sandstone
- claystone
- carbonaceous shale
- dolerite

## Seam

A coal seam is a layer of coal between other rock layers.

In coal geology, seams are central because the mineable product is coal contained in seams. A seam has:

- name
- top depth
- bottom depth
- thickness
- quality
- continuity across boreholes

Seam correlation means matching the same coal seam between different boreholes.

## Recovery

How much core was recovered compared with the drilled interval.

Example:

If a 2.0 m drilling run produces 1.6 m of core, recovery is 80%.

Low recovery may mean broken/poor material, drilling loss, or difficult ground.

## RQD

RQD means Rock Quality Designation.

It is a modified core recovery measure that counts only sound pieces of core longer than about 100 mm / 4 inches. It is used as an indicator of rock mass quality or competence.

High RQD usually means more intact rock. Low RQD usually means more fractured/broken rock.

For coal mine planning and geotechnical review, RQD can help understand roof/floor or surrounding rock conditions.

## Geophysical Logs

Measurements taken down the borehole with instruments.

Common logs may include:

- gamma ray
- density
- resistivity
- sonic
- caliper

These help confirm coal seams, lithology changes, thickness, and sometimes geotechnical or quality indicators.

## Seismic Survey

A geophysical method that images underground layer geometry using reflected waves.

In coal exploration, 2D/3D seismic can help understand seam geometry, faults, continuity, and structures between boreholes.

## Coal Quality

Coal is not only about quantity. Quality matters for economic value and usage.

Common quality parameters:

- ash
- moisture
- volatile matter
- fixed carbon
- sulfur
- GCV/calorific value

## Where PBH-62 Fits

The PBH-62 data we have is mainly:

- borehole logging data
- lithology intervals
- seam intervals
- recovery
- RQD
- remarks
- core box images

It does not currently include:

- real geophysical curves
- lab coal quality data
- exact core box depth ranges
- multiple boreholes for correlation
- seismic data
- production/IoT data

So PBH-62 is a very good starting point for:

- exploration borehole visualization
- geological log review
- remarks search
- seam review
- report drafting
- source-linked AI assistant

It is not yet enough for:

- robust predictive lithology ML
- seam correlation between many boreholes
- core image ML training
- resource estimation
- mine planning

## Where GeoWorkbench Can Sit

GeoWorkbench should sit between raw exploration data and heavy mining/geology packages.

```text
Raw exploration data
  -> GeoWorkbench import, validation, log visualization, review, AI assistant
  -> clean exports / reports / correlation-ready datasets
  -> Minex, Paradigm, GIS, mine planning systems
```

## Practical Product Wedge

The best first wedge is:

> A coal borehole review and interpretation workbench that converts messy logs and core images into track-based visual review, validation, remarks search, seam review, and report drafting.

This is narrow enough to build, but important enough to interest geologists.

## Sources

- Ministry of Coal Technology Roadmap describes exploration stages involving GSI reconnaissance, CMPDI/MECL regional/promotional and detailed exploration, drilling, geophysical logging, 2D/3D seismic, Paradigm, Minex, and online exploration databases.
- CMPDI states it has completed over 1000 coal exploration projects, proved more than 95 billion tonnes of coal reserves, and carries out about 500,000 m of drilling annually.
- ITA-AITES glossary defines RQD as a modified core recovery percentage counting sound core pieces 4 in. or more in length.
- Britannica describes coal deposits as layered seams in sedimentary basins, with seam recoverability affected by thickness, depth, faulting, folding, washouts, and igneous intrusion.
